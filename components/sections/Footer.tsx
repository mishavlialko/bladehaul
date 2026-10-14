import Link from 'next/link';
import Container from '@/components/shared/Container';
import Logo from '@/components/shared/Logo';

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const columns: FooterColumn[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Routes', href: '/#routes' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Car Shipping Cost', href: '/car-shipping-cost' },
      { label: 'Open vs. Enclosed', href: '/open-vs-enclosed-car-shipping' },
      { label: 'Booking and Payment', href: '/booking-and-payment' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Website Terms', href: '/terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper text-text-dim">
      <Container className="py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo size="xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-dim">
              The Sharpest Way to Ship Your Car.
            </p>
            <p className="mt-4 text-sm leading-relaxed">
              BladeHaul Auto Transport LLC
              <br />
              AUTHORIZED Broker of Property Except HHG
              <br />
              USDOT 6803480 · MC 85480782
              <br />
              Mailing address:
              <br />
              11816 Inwood Rd, #1171
              <br />
              Dallas, TX 75244
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/bladehaul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BladeHaul on Instagram"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
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
              <a
                href="https://wa.me/message/GEFAILE4QR5YN1?src=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message BladeHaul on WhatsApp"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="https://x.com/bladehaul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BladeHaul on X"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text-dim transition-colors hover:border-text-faint hover:text-text"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
                </svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text">
                {col.heading}
              </h2>
              <ul className="mt-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {/* Real pages go through next/link; hash + mailto links
                        are plain <a> (next/link skips re-scrolling when the
                        hash is already in the URL). */}
                    {link.href.startsWith('/') && !link.href.includes('#') ? (
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 min-w-11 items-center text-sm text-text-dim transition-colors hover:text-text"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="inline-flex min-h-11 min-w-11 items-center text-sm text-text-dim transition-colors hover:text-text"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <p className="mb-4 max-w-2xl text-sm leading-relaxed">
            Before paying, match the payment instructions to your written
            transport order. If anything changes unexpectedly, confirm it with
            your agent at info@bladehaul.com.
          </p>
          <div className="flex flex-col gap-4 text-xs text-text-dim sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} BladeHaul Auto Transport LLC.</p>
            <a
              href="mailto:info@bladehaul.com"
              className="inline-flex min-h-11 items-center text-text-dim transition-colors hover:text-text"
            >
              info@bladehaul.com
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
