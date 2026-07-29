import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * The one place button styling is defined.
 *
 * CONTRAST IS NOT COSMETIC HERE — see docs/ARCHITECTURE.md §4.1. White text on
 * our orange (#F97316) is 2.80:1 and on WhatsApp green (#25D366) is 1.98:1;
 * both fail WCAG AA. Those two variants therefore use near-black text, which
 * measures 7.20:1 and 10.17:1 respectively. Do not "fix" them to white.
 *
 * The rebrand from gold to orange did not change this rule, only the numbers:
 * the old gold was 1.72:1 against white and failed for exactly the same
 * reason. A saturated warm hue bright enough to read as an action colour is
 * never dark enough to carry white text.
 *
 * Colour also carries meaning: orange ALWAYS means "call", WhatsApp green
 * ALWAYS means "open WhatsApp", blue is brand and navigation. Never use any of
 * them decoratively.
 */
const buttonVariants = cva(
  // Base: shared layout, focus ring, disabled state, and a tap target that
  // meets the 44px minimum on touch devices.
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Default brand action. White on primary-800 (#1E40AF) = 8.72:1. */
        primary: 'bg-primary-800 text-white hover:bg-primary-900',
        /** CALL. Orange + near-black = 7.20:1. Never white — see above. */
        call: 'bg-accent text-neutral-950 hover:bg-accent-hover',
        /** WHATSAPP. Brand green + near-black = 10.17:1. */
        whatsapp: 'bg-whatsapp text-neutral-950 hover:bg-whatsapp-hover',
        outline:
          'border-2 border-primary-800 bg-transparent text-primary-800 hover:bg-primary-50 dark:border-primary-300 dark:text-primary-300 dark:hover:bg-primary-950',
        ghost:
          'bg-transparent text-foreground hover:bg-surface-muted dark:hover:bg-surface',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-11 px-6 text-base [&_svg]:size-5',
        lg: 'h-13 px-8 text-lg [&_svg]:size-5',
        /** Square icon-only button; pair with an aria-label. */
        icon: 'h-11 w-11 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as the child element instead of a <button>. This is how a link gets
   * button styling without nesting an <a> inside a <button>, which is invalid
   * HTML and breaks keyboard navigation.
   */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
