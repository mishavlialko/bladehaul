import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { quoteSchema } from '@/lib/validation';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

async function notify(payload: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    console.log('[quote] Resend not configured, skipping email notify.');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'BladeHaul <quotes@bladehaul.com>',
      to: adminEmail,
      subject: `New quote request: ${payload.pickupZip} → ${payload.deliveryZip}`,
      text: JSON.stringify(payload, null, 2),
    });
  } catch (err) {
    console.error('[quote] Email notify failed:', err);
  }

  const webhookUrl = process.env.BEROCKER_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('[quote] BeRocker webhook failed:', err);
    }
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const quoteId = randomUUID();
  const record = {
    quoteId,
    ...parsed.data,
    receivedAt: new Date().toISOString(),
  };

  console.log('[quote] received', record);

  await notify(record);

  return NextResponse.json({ success: true, quoteId });
}
