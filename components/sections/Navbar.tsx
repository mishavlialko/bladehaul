'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/shared/Button';
import Container from '@/components/shared/Container';
import Logo from '@/components/shared/Logo';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Routes', href: '#routes' },
  { label: 'FAQ', href: '#faq' },
  { label: 'About', href: '#about' },
];

// 4px threshold avoids toggling on micro-scrolls (touch jitter, trackpad inertia tail).
const SCROLL_THRESHOLD = 4;
// Below this, always show — user is near the top.
const TOP_BAND = 80;

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;
    let rafId: number | null = null;

    function update() {
      // iOS auto-scrolls to center a focused input, which would
      // otherwise trigger the hide while the user is typing.
      const ae = document.activeElement;
      if (
        ae &&
        (ae.tagName === 'INPUT' ||
          ae.tagName === 'TEXTAREA' ||
          ae.tagName === 'SELECT')
      ) {
        setHidden(false);
        ticking = false;
        return;
      }

      const y = window.scrollY || document.documentElement.scrollTop || 0;

      if (y < TOP_BAND) {
        setHidden(false);
      } else if (y > lastY + SCROLL_THRESHOLD) {
        setHidden(true);
      } else if (y < lastY - SCROLL_THRESHOLD) {
        setHidden(false);
      }

      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        rafId = requestAnimationFrame(update);
        ticking = true;
      }
    }

    function onFocusIn() {
      setHidden(false);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('focusin', onFocusIn);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('focusin', onFocusIn);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Lock body scroll while the mobile menu is open. No need to touch
  // `hidden` here: the header transform already ignores `hidden` while the
  // menu is open, and the trigger lives inside the header, so the menu can
  // only ever be opened while the header is visible.
  useEffect(() => {
    if (menuOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [menuOpen]);

  // Keyboard handling while the menu is open: ESC closes, Tab cycles inside
  // the panel (focus trap — keyboard users can't tab into the page behind
  // the modal overlay).
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button'),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inPanel = panelRef.current.contains(active);
      if (e.shiftKey && (active === first || !inPanel)) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && (active === last || !inPanel)) {
        first.focus();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Move focus into the panel on open; hand it back to the trigger on close.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (menuOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [menuOpen]);

  // If the viewport crosses the sm breakpoint while the menu is open
  // (rotation, window resize), close it — otherwise body scroll stays
  // locked behind an overlay that sm:hidden just made invisible. The
  // hamburger is hidden ≥sm, so the menu can't be opened there; only the
  // live crossing needs handling.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia('(min-width: 640px)');
    function onChange(e: MediaQueryListEvent) {
      if (e.matches) setMenuOpen(false);
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-paper [padding-top:env(safe-area-inset-top)] transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform motion-reduce:transition-none md:bg-paper/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-paper/85 ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Top utility strip — hidden on mobile. */}
        <div className="hidden border-b border-line md:block">
          <Container className="flex h-10 items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.16em]">
            <p className="flex items-center gap-2 text-text-faint">
              <span className="font-semibold text-text-dim">BLADEHAUL</span>
              <span aria-hidden="true">·</span>
              <span>WYOMING LLC</span>
              <span aria-hidden="true">·</span>
              <span className="text-text-faint/70">[N43&deg; W107&deg;]</span>
            </p>
            <p className="flex items-center gap-2 text-text-faint">
              <span>COAST TO COAST</span>
              <span aria-hidden="true">·</span>
              <span className="text-text-dim">HONEST QUOTES IN &lt; 4H</span>
              <span aria-hidden="true">·</span>
              <a
                href="mailto:info@bladehaul.com"
                className="text-text-dim transition-colors hover:text-orange"
              >
                INFO@BLADEHAUL.COM
              </a>
            </p>
          </Container>
        </div>

        {/* Main row. */}
        <Container
          as="nav"
          aria-label="Primary"
          className="flex h-20 items-center justify-between sm:h-40"
        >
          <Logo size="lg" priority className="sm:hidden" />
          <Logo size="2xl" priority className="hidden sm:inline-block" />

          {/* Hash links are plain <a>: next/link skips the scroll when the
              hash is already in the URL (repeat clicks went dead). */}
          <ul className="hidden items-center gap-10 sm:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-base font-medium text-text-dim transition-colors hover:text-text sm:text-lg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Button
            href="#quote"
            size="lg"
            className="hidden sm:inline-flex sm:h-16 sm:px-8 sm:text-xl"
          >
            Get a Real Quote
          </Button>

          {/* Mobile hamburger trigger. */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="-mr-2 grid h-12 w-12 place-items-center sm:hidden"
          >
            <span className="relative block h-[14px] w-7">
              <span className="absolute left-0 top-0 block h-[2px] w-7 bg-text" />
              <span className="absolute left-0 top-1/2 block h-[2px] w-5 -translate-y-1/2 bg-text" />
              <span className="absolute bottom-0 left-0 block h-[2px] w-7 bg-text" />
            </span>
          </button>
        </Container>
      </header>

      {/* Mobile menu overlay. */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] sm:hidden ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop. */}
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Panel. */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`absolute right-0 top-0 flex h-full w-full flex-col bg-navy text-white transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform motion-reduce:transition-none ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Panel header. */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 [padding-top:calc(env(safe-area-inset-top)+1.25rem)] pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              <span className="text-white/70">NAVIGATION</span>
              <span className="mx-2 text-white/30" aria-hidden="true">
                {'//'}
              </span>
              <span className="text-orange">OPEN</span>
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              tabIndex={menuOpen ? 0 : -1}
              className="-mr-2 grid h-11 w-11 place-items-center"
            >
              <span className="relative block h-5 w-5">
                <span className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
                <span className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
              </span>
            </button>
          </div>

          {/* Nav links. */}
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            <ul>
              {navLinks.map((link, i) => (
                <li
                  key={link.href}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    tabIndex={menuOpen ? 0 : -1}
                    className="group flex items-center gap-5 py-6 transition-colors hover:text-orange"
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-white/40 group-hover:text-orange">
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span className="flex-1 text-2xl font-semibold tracking-tight">
                      {link.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-xl text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-orange"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Panel footer: CTA + dispatch strip. */}
          <div className="border-t border-white/10 px-6 pt-6 [padding-bottom:calc(env(safe-area-inset-bottom)+1.5rem)]">
            <Button
              href="#quote"
              size="lg"
              fullWidth
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="h-14 text-lg"
            >
              Get a Real Quote
            </Button>
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              <a
                href="mailto:info@bladehaul.com"
                className="transition-colors hover:text-orange"
                tabIndex={menuOpen ? 0 : -1}
              >
                INFO@BLADEHAUL.COM
              </a>
              <span aria-hidden="true" className="text-white/20">
                {'//'}
              </span>
              <span>WYOMING LLC</span>
              <span aria-hidden="true" className="text-white/20">
                {'//'}
              </span>
              <span className="text-white/30">[N43&deg; W107&deg;]</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
