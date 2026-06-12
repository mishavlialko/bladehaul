'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Container from '@/components/shared/Container';
import {
  MINI_QUOTE_EVENT,
  type MiniQuotePayload,
} from '@/components/sections/MiniQuoteForm';
import QuoteProgress, {
  type StepIndex,
} from '@/components/sections/QuoteProgress';
import QuoteStepContact from '@/components/sections/QuoteStepContact';
import QuoteStepRoute from '@/components/sections/QuoteStepRoute';
import QuoteStepVehicle from '@/components/sections/QuoteStepVehicle';
import { quoteSchema, STEP_FIELDS, type QuoteInput } from '@/lib/validation';

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const STEP_TITLES: readonly string[] = [
  'Tell us your route',
  'Tell us the vehicle',
  'Where do we send the quote?',
];

const STEP_KEYS: ReadonlyArray<keyof typeof STEP_FIELDS> = [
  'route',
  'vehicle',
  'contact',
];

const STEP_CTAS: readonly string[] = [
  'Vehicle details',
  'Contact details',
  'Get my quote',
];

export default function QuoteForm() {
  const [step, setStep] = useState<StepIndex>(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const methods = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onBlur',
    defaultValues: {
      pickupZip: '',
      deliveryZip: '',
      vehicleYear: '',
      vehicleMake: '',
      vehicleModel: '',
      vin: '',
      readyDate: todayPlus(3),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const {
    handleSubmit,
    trigger,
    reset,
    setFocus,
    getValues,
    formState: { isSubmitting, errors },
  } = methods;

  // Hydrate from sessionStorage if user navigated back to /#quote after a
  // mini-form submit, AND listen for live mini-form submits while this
  // component is already mounted. Both paths run the same hydrate logic.
  useEffect(() => {
    function hydrate(data: Partial<QuoteInput>) {
      // RHF reset() takes a plain values object, not a function. Merge
      // current values with incoming partial here.
      // Note: we deliberately DON'T auto-advance to Step 2 here. The user
      // should see Step 1 pre-filled (with cities resolved beneath each
      // ZIP) so they can visually confirm their entry before pressing Next.
      const current = getValues();
      reset({ ...current, ...data });
      try {
        sessionStorage.removeItem('bladehaul:mini-quote');
      } catch {
        // ignore
      }
    }

    // Path A: page loaded fresh and storage already has data (e.g. user
    // hard-refreshed after submitting mini form).
    try {
      const raw = sessionStorage.getItem('bladehaul:mini-quote');
      if (raw) {
        hydrate(JSON.parse(raw) as Partial<QuoteInput>);
      }
    } catch {
      // ignore
    }

    // Path B: live submit from MiniQuoteForm while this is mounted. Custom
    // event carries the payload directly, no storage round-trip required.
    function onMiniSubmit(e: Event) {
      const detail = (e as CustomEvent<MiniQuotePayload>).detail;
      if (!detail) return;
      hydrate(detail);
    }
    window.addEventListener(MINI_QUOTE_EVENT, onMiniSubmit);
    return () => window.removeEventListener(MINI_QUOTE_EVENT, onMiniSubmit);
  }, [reset, getValues]);

  // Move focus to the step heading on step CHANGE (not initial mount, which
  // would auto-scroll the page to QuoteForm on every fresh visit).
  const isFirstStepRender = useRef(true);
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const goNext = async () => {
    const key = STEP_KEYS[step];
    const fields = STEP_FIELDS[key];
    const valid = await trigger(fields);
    if (!valid) {
      const firstErr = fields.find((f) => errors[f]);
      if (firstErr) setFocus(firstErr);
      return;
    }
    setStep((s) => Math.min(s + 1, 2) as StepIndex);
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0) as StepIndex);
  };

  const onSubmit = async (values: QuoteInput) => {
    setSubmitError(null);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          consentTcpa: true,
          source: 'main-form',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body?.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        'We could not reach the server. Check your connection and try again.',
      );
    }
  };

  return (
    <section
      id="quote"
      className="scroll-mt-28 bg-navy text-white sm:scroll-mt-48 md:scroll-mt-60"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] leading-[1.02] sm:text-4xl lg:text-5xl">
              Get a real quote
            </h2>
            <p className="mt-5 text-lg text-white/65">It takes one minute.</p>
          </div>

          {submitted ? (
            <SuccessState />
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-label="Quote request"
                className="mt-12 rounded-2xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(11,13,17,0.15)] ring-1 ring-line sm:p-10 lg:mt-16"
              >
                <QuoteProgress current={step} />

                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="mb-6 font-display text-xl font-semibold tracking-tight text-text outline-none sm:text-2xl"
                >
                  {STEP_TITLES[step]}
                </h3>

                {step === 0 && <QuoteStepRoute />}
                {step === 1 && <QuoteStepVehicle />}
                {step === 2 && <QuoteStepContact />}

                {submitError && (
                  <p
                    role="alert"
                    className="mt-6 rounded-lg bg-orange-bg px-4 py-3 text-sm font-medium text-orange-dark"
                  >
                    {submitError}
                  </p>
                )}

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-white transition duration-200 ease-out-quart hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985]"
                    >
                      <span>{STEP_CTAS[step]}</span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06]"
                      >
                        <ArrowRight strokeWidth={1.75} className="h-4 w-4" />
                      </span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-white transition duration-200 ease-out-quart hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                    >
                      <span>{isSubmitting ? 'Sending…' : STEP_CTAS[step]}</span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06]"
                      >
                        <ArrowRight strokeWidth={1.75} className="h-4 w-4" />
                      </span>
                    </button>
                  )}

                  {step > 0 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="text-sm text-text-dim underline-offset-4 transition-colors duration-200 ease-out-quart hover:text-text hover:underline"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                {step === 2 && (
                  <p className="mt-6 text-xs leading-relaxed text-text-dim">
                    By clicking Get my quote, you agree BladeHaul can contact
                    you about your shipment by phone, text, or email at the
                    contact info above. We never use robocalls or autodialers,
                    and we never share your info. Message rates may apply.
                  </p>
                )}

                <p className="mt-4 text-center text-xs text-text-faint sm:text-left">
                  No spam. No robocalls. A real person reads every quote
                  request.
                </p>
              </form>
            </FormProvider>
          )}
        </div>
      </Container>
    </section>
  );
}

function SuccessState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-12 rounded-2xl bg-white p-8 text-center shadow-[0_30px_60px_-30px_rgba(11,13,17,0.15)] ring-1 ring-line sm:p-12 lg:mt-16"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange/15 ring-1 ring-orange/30">
        <Check
          strokeWidth={2.25}
          className="h-6 w-6 text-orange"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
        Quote request received
      </h3>
      <p className="mt-4 text-base text-text-dim sm:text-lg">
        Misha will email you a real quote. If you added a phone number,
        you&apos;ll also get a text.
      </p>
      <div className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-text-dim">
        <p className="font-semibold text-text">What happens now:</p>
        <ul className="space-y-3">
          <li>
            <span className="font-semibold text-text">Right away:</span> Your
            request lands with Misha. Not a queue, not a call center.
          </li>
          <li>
            <span className="font-semibold text-text">
              Within 2 business hours:
            </span>{' '}
            You get a real quote by email, based on live carrier rates for
            your exact route. Requests sent overnight go out first thing the
            next business morning.
          </li>
          <li>
            <span className="font-semibold text-text">
              When you&apos;re ready:
            </span>{' '}
            Reply to lock it in or ask anything. Same person, every time.
          </li>
        </ul>
      </div>
      <p className="mt-6 text-sm text-text-faint">
        Need to talk now? Email{' '}
        <a
          href="mailto:info@bladehaul.com"
          className="font-medium text-text underline underline-offset-4 hover:text-orange"
        >
          info@bladehaul.com
        </a>
      </p>
    </div>
  );
}
