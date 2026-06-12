'use client';

import { useEffect } from 'react';

// Browsers ignore a click on an anchor whose hash is already in the URL —
// the page silently doesn't re-scroll (second click on "Get a Real Quote"
// did nothing). This one delegated listener makes every in-page anchor
// scroll on every click, keeps the URL hash in sync without piling up
// history entries, and moves focus for skip-link accessibility.
export default function AnchorScroll() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element).closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href')!.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      // Focusable targets (e.g. main#main with tabIndex={-1}) receive focus
      // so the skip link keeps working; non-focusable sections are a no-op.
      target.focus({ preventScroll: true });
      window.history.replaceState(null, '', `#${id}`);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
