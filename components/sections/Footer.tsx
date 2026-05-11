import Link from 'next/link';
import Container from '@/components/shared/Container';
import Logo from '@/components/shared/Logo';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const columns: FooterColumn[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: 'mailto:info@bladehaul.com', external: true },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Routes', href: '#routes' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white text-text-dim">
      <Container className="py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo size="xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-dim">
              The Sharpest Way to Ship Your Car.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/bladehaul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BladeHaul on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@bladehaul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BladeHaul on TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M19.5 8.7a6.6 6.6 0 0 1-3.9-1.3v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.1v2.7a2.7 2.7 0 1 0 1.9 2.6V3h2.7a3.9 3.9 0 0 0 3.9 3.9v1.8Z" />
                </svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-sm text-text-dim transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <div className="flex flex-col gap-4 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} BladeHaul Auto Transport LLC.</p>
            <a
              href="mailto:info@bladehaul.com"
              className="text-text-dim transition-colors hover:text-text"
            >
              info@bladehaul.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
