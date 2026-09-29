type Environment = Record<string, string | undefined>;

export function getQuoteStorageConfig(env: Environment = process.env) {
  const environment = env.VERCEL_ENV || 'development';
  if (!['production', 'preview', 'development'].includes(environment))
    throw new Error('quote_environment_invalid');
  if (env.QUOTE_STORAGE_NAMESPACE !== environment)
    throw new Error('quote_namespace_mismatch');
  const storeId = env.BLOB_STORE_ID?.trim();
  if (!storeId) throw new Error('quote_store_missing');
  if (!env.CRON_SECRET || env.CRON_SECRET.length < 32)
    throw new Error('quote_cron_secret_missing');
  return { namespace: environment, storeId };
}

export function getQuoteEmailConfig(env: Environment = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM_EMAIL?.trim();
  const recipient = env.ADMIN_EMAIL?.trim();
  // Explicit settings are required; a missing sender or recipient must not
  // silently redirect customer information to an old/default account.
  if (!apiKey || !from || !recipient) throw new Error('quote_email_missing');
  if (
    !/^(?:[a-zA-Z0-9._+-]+@bladehaul\.com|BladeHaul <[a-zA-Z0-9._+-]+@bladehaul\.com>)$/.test(
      from,
    )
  )
    throw new Error('quote_sender_invalid');
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(recipient))
    throw new Error('quote_recipient_invalid');
  if (env.VERCEL_ENV === 'production' && recipient !== 'info@bladehaul.com')
    throw new Error('quote_production_recipient_invalid');
  return { apiKey, from, recipient };
}

export function quoteAllowedOrigins(
  requestUrl: string,
  env: Environment = process.env,
): string[] {
  const environment = env.VERCEL_ENV || 'development';
  if (environment === 'development') {
    const url = new URL(requestUrl);
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      ? [url.origin]
      : [];
  }
  if (environment === 'preview') {
    return [env.VERCEL_URL, env.VERCEL_BRANCH_URL]
      .filter((value): value is string => Boolean(value))
      .map((host) => `https://${host}`);
  }
  const url = new URL(env.NEXT_PUBLIC_SITE_URL || 'https://bladehaul.com');
  if (url.protocol !== 'https:') throw new Error('quote_site_origin_invalid');
  return [url.origin];
}
