import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Scroll-reveal wrapper.
 *
 * A SERVER component that adds nothing but a class. The reveal itself is a CSS
 * scroll-driven animation (see `.reveal` in globals.css), which means the whole
 * homepage ships zero animation JavaScript and degrades to plain visible
 * content on browsers without scroll-timeline support or for users who have
 * asked for reduced motion.
 *
 * This is deliberately not Framer Motion: a motion component server-renders
 * its hidden start frame, so a slow or broken bundle would leave the page
 * blank — the same failure this project already hit with FloatingActions.
 */
export function AnimatedSection({
  as: Tag = 'section',
  className,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn('reveal', className)} {...props}>
      {children}
    </Tag>
  );
}
