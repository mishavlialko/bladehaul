'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

// "size" is the rendered height in px. Width is derived from the SVG viewBox
// (39.27 × 22.98 → aspect ratio ≈ 1.709) so the wordmark keeps its proportions.
const heightPx: Record<Size, number> = {
  sm: 22,
  md: 32,
  lg: 44,
  xl: 64,
  '2xl': 88,
  '3xl': 128,
  '4xl': 176,
};

const ASPECT_RATIO = 39.27 / 22.98;

// On the single-page home route a plain <Link href="/"> often does nothing
// (same URL → no navigation, no scroll). Intercept so the logo always returns
// to the very top, clearing any #section hash on the way.
function handleHomeClick(e: MouseEvent<HTMLAnchorElement>) {
  if (window.location.pathname !== '/') return; // from /privacy, /terms: navigate normally
  e.preventDefault();
  if (window.location.hash) {
    window.history.replaceState(null, '', '/');
  }
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

type LogoProps = {
  size?: Size;
  href?: string;
  className?: string;
  // Accepted for API compatibility but unused (SVG is ~3 KB, no preload needed).
  priority?: boolean;
};

export default function Logo({
  size = 'md',
  href = '/',
  className,
}: LogoProps) {
  const h = heightPx[size];
  const w = Math.round(h * ASPECT_RATIO);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- SVG, no optimization needed
    <img src="/logo.svg" alt="" width={w} height={h} className="block" />
  );

  if (!href) {
    return <span className={className}>{img}</span>;
  }

  return (
    <Link
      href={href}
      aria-label="BladeHaul home"
      onClick={href === '/' ? handleHomeClick : undefined}
      className={cn('inline-block', className)}
    >
      {img}
    </Link>
  );
}
