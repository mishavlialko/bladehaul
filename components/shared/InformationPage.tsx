import type { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import Button from '@/components/shared/Button';
import Container from '@/components/shared/Container';

type InformationPageProps = {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
  relatedLinks?: { href: string; label: string }[];
  showContactLink?: boolean;
  showIntroQuote?: boolean;
};

const linkClass =
  'inline-flex min-h-11 items-center font-medium text-text underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange';

export default function InformationPage({
  eyebrow,
  title,
  intro,
  children,
  relatedLinks = [],
  showContactLink = true,
  showIntroQuote = true,
}: InformationPageProps) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <article className="bg-white pb-24 pt-[calc(8rem+env(safe-area-inset-top))] text-text sm:pb-28 sm:pt-[calc(9rem+env(safe-area-inset-top))] lg:pb-32 lg:pt-[calc(13rem+env(safe-area-inset-top))]">
          <Container className="max-w-3xl">
            <Link href="/" className={`${linkClass} text-sm`}>
              Back to BladeHaul
            </Link>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-text-dim">
              {intro}
            </div>
            {showIntroQuote && (
              <Button href="/#quote" className="mt-7">
                Request a free quote
              </Button>
            )}
            {children}
            <div className="mt-12 border-t border-line pt-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <Button href="/#quote">Request a free quote</Button>
                {showContactLink && (
                  <Link href="/contact" className={linkClass}>
                    Contact BladeHaul
                  </Link>
                )}
              </div>
              {relatedLinks.length > 0 && (
                <nav aria-label="Related shipping guides" className="mt-8">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                    More about car shipping
                  </h2>
                  <ul className="mt-3">
                    {relatedLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </Container>
        </article>
      </main>
      <Footer />
    </>
  );
}
