import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const sizePx: Record<Size, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
  '3xl': 192,
};

type LogoProps = {
  size?: Size;
  href?: string;
  className?: string;
  priority?: boolean;
};

export default function Logo({
  size = 'md',
  href = '/',
  className,
  priority = false,
}: LogoProps) {
  const px = sizePx[size];

  const img = (
    <Image
      src="/logo.png"
      alt=""
      width={px}
      height={px}
      priority={priority}
      className="block"
    />
  );

  if (!href) {
    return <span className={className}>{img}</span>;
  }

  return (
    <Link
      href={href}
      aria-label="BladeHaul home"
      className={cn('inline-block', className)}
    >
      {img}
    </Link>
  );
}
