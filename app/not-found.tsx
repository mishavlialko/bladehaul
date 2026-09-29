import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/sections/Navbar';

const NOT_FOUND_TITLE = 'Page not found';
const NOT_FOUND_DESCRIPTION =
  'This page does not exist on BladeHaul. Return home for US car shipping information.';

export const metadata: Metadata = {
  title: NOT_FOUND_TITLE,
  description: NOT_FOUND_DESCRIPTION,
  // Clear root layout homepage canonical so 404 does not advertise /.
  alternates: { canonical: null },
  robots: { index: false, follow: false },
  openGraph: {
    title: NOT_FOUND_TITLE,
    description: NOT_FOUND_DESCRIPTION,
    // Clear root layout homepage og:url.
    url: null,
  },
  twitter: {
    card: 'summary',
    title: NOT_FOUND_TITLE,
    description: NOT_FOUND_DESCRIPTION,
  },
};

const linkClass =
  'font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="bg-white pb-24 pt-[calc(8rem+env(safe-area-inset-top))] text-text sm:pb-28 sm:pt-[calc(9rem+env(safe-area-inset-top))] lg:pb-32 lg:pt-[calc(13rem+env(safe-area-inset-top))]">
          <Container className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-faint">
              Error 404
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Page not found
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-dim">
              The page you requested is not on this site. It may have moved, or
              the link may be incorrect.
            </p>
            <p className="mt-8">
              <Link
                href="/"
                className={`${linkClass} inline-flex min-h-11 items-center text-sm`}
              >
                Back to BladeHaul home
              </Link>
            </p>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
