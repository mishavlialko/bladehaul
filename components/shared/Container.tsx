import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerOwnProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
};

type ContainerProps<T extends ElementType> = ContainerOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ContainerOwnProps<T>>;

export default function Container<T extends ElementType = 'div'>({
  as,
  children,
  className,
  ...rest
}: ContainerProps<T>) {
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
