'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { FaqItem } from '@/types';

/**
 * FAQ list.
 *
 * Radix Accordion rather than <details>/<summary> so the open/close state is
 * controlled, only one panel is open at a time, and arrow-key navigation
 * between headers works. Radix also wires the aria-expanded / aria-controls
 * pair, which is the part hand-rolled accordions usually get wrong.
 *
 * `type="single" collapsible` matches how people actually read an FAQ: open
 * one question, read it, open the next.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const locale = useLocale();
  const isNe = locale === 'ne';

  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="border-b last:border-0"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group hover:text-primary-800 dark:hover:text-primary-300 flex w-full items-start justify-between gap-4 py-5 text-left text-base font-semibold transition-colors">
              <span className="text-pretty">
                {isNe ? item.questionNe : item.questionEn}
              </span>
              <ChevronDown
                className="text-muted-foreground mt-0.5 size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>

          {/* Radix exposes the panel height as a CSS var so the open/close can
              be animated without measuring anything in JS. */}
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.2s_ease-out]">
            <p className="text-muted-foreground pb-5 leading-relaxed text-pretty">
              {isNe ? item.answerNe : item.answerEn}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
