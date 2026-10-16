import { initBotId } from 'botid/client/core';
import {
  rememberQuoteAttribution,
  sessionStore,
} from '@/lib/quote-attribution';

// Runs once per full page load, before the app hydrates.
rememberQuoteAttribution(window.location, sessionStore());

try {
  initBotId({
    protect: [
      {
        path: '/api/quote',
        method: 'POST',
        advancedOptions: { checkLevel: 'basic' },
      },
    ],
  });
} catch {
  // Keep the form interactive; the server still rejects missing verification.
  console.warn('[quote] browser_verification_unavailable');
}
