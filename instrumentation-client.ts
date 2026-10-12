import { initBotId } from 'botid/client/core';

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
