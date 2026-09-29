'use client';

import { useEffect } from 'react';

// Browsers ignore a click on an anchor whose hash is already in the URL —
// the page silently doesn't re-scroll (second click on "Get a Real Quote"
// did nothing). This one delegated listener makes every in-page anchor
// scroll on every click, keeps the URL hash in sync without piling up
// history entries, and moves focus for skip-link accessibility.
export default function AnchorScroll() {
  useEffect(() => {
    let focusFrame: number | null = null;
    const cleanupTargets = new Set<() => void>();

    function focusTarget(target: HTMLElement, attempts = 0) {
      focusFrame = requestAnimationFrame(() => {
        // React closes the mobile menu and clears inert after its click.
        // Wait for that change before handing focus to the destination.
        if (target.closest('[inert]')) {
          if (attempts < 3) focusTarget(target, attempts + 1);
          return;
        }
        if (!target.isConnected) return;
        const temporaryTabIndex =
          !target.hasAttribute('tabindex') &&
          !target.matches('a[href], button, input, select, textarea');
        if (temporaryTabIndex) {
          target.tabIndex = -1;
          const cleanup = () => {
            target.removeAttribute('tabindex');
            target.removeEventListener('blur', cleanup);
            cleanupTargets.delete(cleanup);
          };
          target.addEventListener('blur', cleanup, { once: true });
          cleanupTargets.add(cleanup);
        }
        target.focus({ preventScroll: true });
      });
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element).closest?.('a[href]');
      if (!anchor) return;
      if (anchor.getAttribute('target') === '_blank') return;
      const url = new URL(anchor.getAttribute('href')!, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        return;
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
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
      if (focusFrame !== null) cancelAnimationFrame(focusFrame);
      focusTarget(target);
      window.history.replaceState(null, '', url.hash);
    }
    document.addEventListener('click', onClick);
    // A /#section link from a legal page uses normal page navigation. Give
    // keyboard users the same destination focus after the new page mounts.
    try {
      const initialTarget = document.getElementById(
        decodeURIComponent(window.location.hash.slice(1)),
      );
      if (initialTarget) focusTarget(initialTarget);
    } catch {
      // A malformed hash should not interfere with normal page navigation.
    }
    return () => {
      document.removeEventListener('click', onClick);
      if (focusFrame !== null) cancelAnimationFrame(focusFrame);
      for (const cleanup of cleanupTargets) cleanup();
    };
  }, []);

  return null;
}
