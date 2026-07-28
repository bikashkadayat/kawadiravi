import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Consistent section title + optional subtitle.
 *
 * Headings render as <h2> by default because every homepage section sits under
 * the single <h1> in the hero; passing `as="h3"` keeps nested sections from
 * breaking the document outline.
 */
export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  as: Tag = 'h2',
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <Tag className="text-primary-900 dark:text-primary-200 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        {title}
      </Tag>
      {subtitle && (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
