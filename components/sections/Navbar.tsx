import Link from 'next/link';
import Button from '@/components/shared/Button';
import Container from '@/components/shared/Container';
import Logo from '@/components/shared/Logo';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Routes', href: '#routes' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/95 backdrop-blur supports-[backdrop-filter]:bg-navy/80">
      <Container
        as="nav"
        aria-label="Primary"
        className="flex h-20 items-center justify-between sm:h-24"
      >
        <Logo size="lg" priority />

        <ul className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Button href="#quote" size="md">
          Get a Real Quote
        </Button>
      </Container>
    </header>
  );
}
