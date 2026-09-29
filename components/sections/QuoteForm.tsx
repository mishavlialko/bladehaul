'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
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
import {
  QUOTE_CONSENT_VERSION,
  quoteSchema,
  STEP_FIELDS,
  type QuoteInput,
} from '@/lib/validation';

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

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function QuoteForm() {
  const [step, setStep] = useState<StepIndex>(0);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<keyof QuoteInput | null>(null);
  const submissionInFlight = useRef(false);
  const retryRequest = useRef<{
    fingerprint: string;
    requestId: string;
  } | null>(null);

  const methods = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onBlur',
    shouldFocusError: false,
    defaultValues: {
      requestId: '',
      pickupZip: '',
      deliveryZip: '',
      vehicleYear: '',
      vehicleMake: '',
      vehicleModel: '',
      vin: '',
      additionalDetails: '',
      readyDate: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      consentTcpa: false,
      consentVersion: QUOTE_CONSENT_VERSION,
      source: 'main-form',
      website: '',
    },
  });

  const {
    handleSubmit,
    trigger,
    reset,
    setFocus,
    setValue,
    getValues,
    getFieldState,
    clearErrors,
    formState: { isSubmitting, submitCount },
  } = methods;

  // Hydrate from sessionStorage if user navigated back to /#quote after a
  // mini-form submit, AND listen for live mini-form submits while this
  // component is already mounted. Both paths run the same hydrate logic.
  useEffect(() => {
    function hydrate(data: MiniQuotePayload) {
      if (submissionInFlight.current) return;
      if (
        !data ||
        typeof data.pickupZip !== 'string' ||
        typeof data.deliveryZip !== 'string' ||
        !/^\d{5}$/.test(data.pickupZip) ||
        !/^\d{5}$/.test(data.deliveryZip) ||
        !['open', 'enclosed'].includes(data.trailerType)
      )
        return;
      // RHF reset() takes a plain values object, not a function. Merge
      // current values with incoming partial here.
      // Note: we deliberately DON'T auto-advance to Step 2 here. The user
      // should see Step 1 pre-filled (with cities resolved beneath each
      // ZIP) so they can visually confirm their entry before pressing Next.
      const current = getValues();
      reset({
        ...current,
        pickupZip: data.pickupZip,
        deliveryZip: data.deliveryZip,
        trailerType: data.trailerType,
        source: 'hero-mini',
        requestId: '',
      });
      retryRequest.current = null;
      setReceiptId(null);
      setSubmitError(null);
      setStep(0);
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
        hydrate(JSON.parse(raw) as MiniQuotePayload);
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
    if (pendingFocus.current) {
      setFocus(pendingFocus.current);
      pendingFocus.current = null;
      return;
    }
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, setFocus]);

  const goNext = async () => {
    const key = STEP_KEYS[step];
    const fields = STEP_FIELDS[key];
    const valid = await trigger(fields);
    if (!valid) {
      const firstErr = fields.find((field) => getFieldState(field).error);
      if (firstErr) setFocus(firstErr);
      return;
    }
    const nextStep = Math.min(step + 1, 2) as StepIndex;
    if (submitCount === 0) {
      // A step transition should not greet the visitor with untouched-field
      // errors. Keep any server rejection and all errors after a real submit.
      clearErrors(
        STEP_FIELDS[STEP_KEYS[nextStep]].filter((field) => {
          const state = getFieldState(field);
          return !state.isTouched && state.error?.type !== 'server';
        }),
      );
    }
    setStep(nextStep);
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0) as StepIndex);
  };

  const onSubmit = async (values: QuoteInput) => {
    setSubmitError(null);
    const fingerprint = JSON.stringify({ ...values, requestId: undefined });
    const requestId =
      retryRequest.current?.fingerprint === fingerprint
        ? retryRequest.current.requestId
        : retryRequest.current
          ? createRequestId()
          : values.requestId;
    retryRequest.current = { fingerprint, requestId };
    setValue('requestId', requestId);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, requestId }),
        signal: controller.signal,
      });
      const body = await res.json().catch(() => null);
      if (res.status === 409) {
        retryRequest.current = null;
        setValue('requestId', '');
        setSubmitError(
          'This request was changed. Your details are still here. Please send it again.',
        );
        return;
      }
      if (res.status === 400 && body?.issues?.fieldErrors) {
        const serverErrors: FieldErrors<QuoteInput> = {};
        for (const field of Object.values(STEP_FIELDS).flat()) {
          const message = body.issues.fieldErrors[field]?.[0];
          if (typeof message !== 'string') continue;
          serverErrors[field] = { type: 'server', message };
          methods.setError(field, { type: 'server', message });
        }
        if (Object.keys(serverErrors).length > 0) {
          onInvalid(serverErrors);
          return;
        }
      }
      if (
        res.status !== 202 ||
        body?.success !== true ||
        body?.quoteId !== requestId
      ) {
        setSubmitError(
          typeof body?.error === 'string'
            ? body.error
            : 'We could not confirm receipt. Your details are still here. Please try again.',
        );
        return;
      }
      setReceiptId(requestId);
    } catch {
      setSubmitError(
        'We could not confirm receipt. Check your connection and try again. Your details are still here.',
      );
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const onInvalid = (validationErrors: FieldErrors<QuoteInput>) => {
    for (const [index, key] of STEP_KEYS.entries()) {
      const field = STEP_FIELDS[key].find((name) => validationErrors[name]);
      if (!field) continue;
      if (index === step) setFocus(field);
      else {
        pendingFocus.current = field;
        setStep(index as StepIndex);
      }
      return;
    }
    setSubmitError('Please refresh this page before sending a new request.');
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInFlight.current) return;
    if (step < 2) {
      await goNext();
      return;
    }
    submissionInFlight.current = true;
    try {
      if (!getValues('requestId')) setValue('requestId', createRequestId());
      await handleSubmit(onSubmit, onInvalid)(event);
    } catch {
      setSubmitError(
        'We could not send your request. Your details are still here. Please try again.',
      );
    } finally {
      submissionInFlight.current = false;
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
            <h2 className="font-display text-3xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Get a real quote
            </h2>
            <p className="mt-5 text-lg text-white/65">It takes one minute.</p>
          </div>

          {receiptId ? (
            <SuccessState quoteId={receiptId} />
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={onFormSubmit}
                noValidate
                aria-label="Quote request"
                className="mt-12 rounded-2xl bg-white p-6 ring-1 ring-line sm:p-10 lg:mt-16"
              >
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="quote-website">Leave this field empty</label>
                  <input
                    id="quote-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    maxLength={200}
                    {...methods.register('website')}
                  />
                </div>
                <QuoteProgress current={step} />

                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="mb-6 font-display text-xl font-semibold tracking-tight text-text outline-none sm:text-2xl"
                >
                  {STEP_TITLES[step]}
                </h3>

                <fieldset disabled={isSubmitting} className="min-w-0">
                  {step === 0 && <QuoteStepRoute />}
                  {step === 1 && <QuoteStepVehicle />}
                  {step === 2 && <QuoteStepContact />}
                </fieldset>

                {submitError && (
                  <div
                    role="alert"
                    className="mt-6 rounded-lg bg-orange-bg px-4 py-3 text-sm font-medium text-orange-dark"
                  >
                    <p>{submitError}</p>
                    <p className="mt-2">
                      You can also email{' '}
                      <a
                        href="mailto:info@bladehaul.com"
                        className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                      >
                        info@bladehaul.com
                      </a>
                      .
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
                  {step < 2 ? (
                    <button
                      key="advance-step"
                      type="button"
                      onClick={(event) => {
                        // Cancel activation before the next render can replace
                        // this control with the final submit button.
                        event.preventDefault();
                        void goNext();
                      }}
                      className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-navy transition duration-200 ease-out-quart hover:bg-orange-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985] active:text-white"
                    >
                      <span>{STEP_CTAS[step]}</span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 transition-[transform,background-color] duration-200 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06] group-hover:bg-white/15"
                      >
                        <ArrowRight strokeWidth={1.75} className="h-4 w-4" />
                      </span>
                    </button>
                  ) : (
                    <button
                      key="submit-quote"
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-orange pl-7 pr-3 text-base font-medium tracking-tight text-navy transition duration-200 ease-out-quart hover:bg-orange-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange active:scale-[0.985] active:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                    >
                      <span>{isSubmitting ? 'Sending…' : STEP_CTAS[step]}</span>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 transition-[transform,background-color] duration-200 ease-out-quart group-hover:translate-x-1 group-hover:scale-[1.06] group-hover:bg-white/15"
                      >
                        <ArrowRight strokeWidth={1.75} className="h-4 w-4" />
                      </span>
                    </button>
                  )}

                  {step > 0 && (
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={isSubmitting}
                      className="inline-flex min-h-11 items-center justify-center px-2 text-sm text-text-dim underline-offset-4 transition-colors duration-200 ease-out-quart hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:opacity-60"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-sm text-text-faint sm:text-left">
                  A real person reviews your route and vehicle details.
                </p>
              </form>
            </FormProvider>
          )}
        </div>
      </Container>
    </section>
  );
}

function SuccessState({ quoteId }: { quoteId: string }) {
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    confirmationRef.current?.focus();
  }, []);

  return (
    <div
      ref={confirmationRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="mt-12 rounded-2xl bg-white p-8 text-center outline-none ring-1 ring-line sm:p-12 lg:mt-16"
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
        Your request has been saved. A BladeHaul agent will review your details
        and follow up by email.
      </p>
      <div className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-text-dim">
        <p className="font-semibold text-text">What happens now:</p>
        <ul className="space-y-3">
          <li>
            <span className="font-semibold text-text">Right away:</span> Your
            route and vehicle details are ready for review.
          </li>
          <li>
            <span className="font-semibold text-text">
              Within 2 business hours:
            </span>{' '}
            We aim to reply by email with your quote or any questions about your
            shipment. Requests sent outside business hours are reviewed the next
            business day.
          </li>
          <li>
            <span className="font-semibold text-text">
              When you&apos;re ready:
            </span>{' '}
            Review the quote and ask any questions. Booking is a separate step.
          </li>
        </ul>
      </div>
      <p className="mt-6 break-all font-mono text-sm text-text-faint">
        Request reference: {quoteId}
      </p>
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
