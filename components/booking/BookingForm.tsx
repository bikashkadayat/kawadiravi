'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  AREAS,
  SCRAP_TYPES,
  TIME_SLOTS,
  buildBookingMessage,
  buildCalendarUrl,
  todayIso,
  validateBooking,
  type BookingErrors,
  type BookingOption,
  type BookingValues,
} from '@/lib/booking';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

const EMPTY: BookingValues = {
  name: '',
  phone: '',
  address: '',
  area: '',
  scrapTypes: [],
  weight: '',
  date: '',
  timeSlot: '',
  notes: '',
};

const FIELD_CLASS =
  'bg-background focus:border-primary-600 mt-1.5 min-h-12 w-full rounded-xl border px-4 py-3 text-base outline-none';

/**
 * Scrap-pickup booking form.
 *
 * On submit it composes a Nepali WhatsApp message and navigates to a `wa.me`
 * deep link. There is no backend and nothing is stored — see `lib/booking.ts`.
 *
 * `window.location.href` rather than `window.open`: this form is submitted on a
 * phone the overwhelming majority of the time, and a same-tab navigation hands
 * off to the installed WhatsApp app cleanly. `window.open` is treated as a
 * popup by several in-app browsers (Facebook, Instagram) and gets swallowed
 * silently — the customer taps Book and nothing happens. The confirmation
 * panel below also renders the link directly, so a blocked navigation always
 * leaves a tappable way through.
 */
export function BookingForm() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const isNe = locale === 'ne';

  const [values, setValues] = useState<BookingValues>(EMPTY);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  /**
   * `min` is written to the DOM after mount, never rendered.
   *
   * This is a static export: anything computed during render is frozen at
   * BUILD time. `min={todayIso()}` would therefore ship the date the site was
   * last deployed, and a week later the picker would happily accept dates in
   * the past. Reading the clock on the client is the only way to get the real
   * today.
   *
   * Setting the attribute directly rather than via state is deliberate: `min`
   * is a property of an external system (the DOM), not React state, so this is
   * the sanctioned use of an effect and it costs no extra render. Submit-time
   * validation re-checks the date regardless, so a stale or missing `min` can
   * never actually let a past date through — the picker constraint is a
   * convenience, not the guard.
   */
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIso();
  }, []);

  const ids = {
    name: useId(),
    phone: useId(),
    address: useId(),
    area: useId(),
    weight: useId(),
    date: useId(),
    time: useId(),
    notes: useId(),
    scrap: useId(),
  };

  const label = (o: BookingOption) => (isNe ? o.labelNe : o.labelEn);

  function set<K extends keyof BookingValues>(key: K, value: BookingValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear this field's error as soon as the user edits it, rather than making
    // them submit again to find out whether they fixed it.
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
  }

  function toggleScrap(id: string) {
    setValues((v) => ({
      ...v,
      scrapTypes: v.scrapTypes.includes(id)
        ? v.scrapTypes.filter((s) => s !== id)
        : [...v.scrapTypes, id],
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateBooking(values, todayIso());
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Move focus to the first problem so a keyboard or screen-reader user is
      // not left guessing which of nine fields failed.
      const first = Object.keys(found)[0] as keyof typeof ids;
      document.getElementById(ids[first] ?? '')?.focus();
      return;
    }

    setErrors({});
    setSubmitted(true);

    const url = buildWhatsAppUrl(buildBookingMessage(values));
    // Small delay so the confirmation panel paints before the tab is replaced;
    // without it the user sees nothing happen and may tap twice.
    window.setTimeout(() => {
      window.location.href = url;
    }, 600);
  }

  const whatsappUrl = submitted
    ? buildWhatsAppUrl(buildBookingMessage(values))
    : '';
  const calendarUrl = submitted ? buildCalendarUrl(values) : null;

  /** Inline error text + the aria wiring that makes it announced. */
  function fieldError(field: keyof BookingErrors, id: string) {
    if (!errors[field]) return null;
    return (
      <p id={`${id}-error`} role="alert" className="text-destructive mt-1.5 text-sm font-medium">
        {t(errors[field] as string)}
      </p>
    );
  }

  const aria = (field: keyof BookingErrors, id: string) =>
    errors[field]
      ? ({ 'aria-invalid': true, 'aria-describedby': `${id}-error` } as const)
      : {};

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Two columns from `md`; every field is full width on a phone. */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className="text-sm font-semibold">
            {t('name')} <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.name}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={t('namePlaceholder')}
            className={FIELD_CLASS}
            {...aria('name', ids.name)}
          />
          {fieldError('name', ids.name)}
        </div>

        <div>
          <label htmlFor={ids.phone} className="text-sm font-semibold">
            {t('phone')} <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.phone}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
            className={FIELD_CLASS}
            {...aria('phone', ids.phone)}
          />
          {fieldError('phone', ids.phone)}
        </div>

        <div>
          <label htmlFor={ids.address} className="text-sm font-semibold">
            {t('address')} <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.address}
            type="text"
            autoComplete="street-address"
            value={values.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder={t('addressPlaceholder')}
            className={FIELD_CLASS}
            {...aria('address', ids.address)}
          />
          {fieldError('address', ids.address)}
        </div>

        <div>
          <label htmlFor={ids.area} className="text-sm font-semibold">
            {t('area')}{' '}
            <span className="text-muted-foreground font-normal">
              ({t('optional')})
            </span>
          </label>
          <select
            id={ids.area}
            value={values.area}
            onChange={(e) => set('area', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">{t('areaPlaceholder')}</option>
            {AREAS.map((a) => (
              <option key={a.id} value={label(a)}>
                {label(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrap types — a fieldset so the group has one accessible name rather
          than thirteen orphaned checkboxes. */}
      <fieldset>
        <legend className="text-sm font-semibold">
          {t('scrapTypes')}{' '}
          <span className="text-muted-foreground font-normal">
            ({t('optional')})
          </span>
        </legend>
        <div
          id={ids.scrap}
          className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {SCRAP_TYPES.map((type) => {
            const checked = values.scrapTypes.includes(type.id);
            return (
              <label
                key={type.id}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900 dark:text-white'
                    : 'hover:bg-surface-muted dark:hover:bg-white/5',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleScrap(type.id)}
                  className="accent-primary-800 size-4 shrink-0"
                />
                <span>{label(type)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={ids.date} className="text-sm font-semibold">
            {t('date')} <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.date}
            ref={dateRef}
            type="date"
            value={values.date}
            onChange={(e) => set('date', e.target.value)}
            className={FIELD_CLASS}
            {...aria('date', ids.date)}
          />
          {fieldError('date', ids.date)}
        </div>

        <div>
          <label htmlFor={ids.time} className="text-sm font-semibold">
            {t('timeSlot')} <span aria-hidden="true">*</span>
          </label>
          <select
            id={ids.time}
            value={values.timeSlot}
            onChange={(e) => set('timeSlot', e.target.value)}
            className={FIELD_CLASS}
            {...aria('timeSlot', ids.time)}
          >
            <option value="">{t('timeSlotPlaceholder')}</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {label(slot)}
              </option>
            ))}
          </select>
          {fieldError('timeSlot', ids.time)}
        </div>

        <div>
          <label htmlFor={ids.weight} className="text-sm font-semibold">
            {t('weight')}{' '}
            <span className="text-muted-foreground font-normal">
              ({t('optional')})
            </span>
          </label>
          <input
            id={ids.weight}
            type="text"
            value={values.weight}
            onChange={(e) => set('weight', e.target.value)}
            placeholder={t('weightPlaceholder')}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={ids.notes} className="text-sm font-semibold">
            {t('notes')}{' '}
            <span className="text-muted-foreground font-normal">
              ({t('optional')})
            </span>
          </label>
          <textarea
            id={ids.notes}
            rows={3}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder={t('notesPlaceholder')}
            className={`${FIELD_CLASS} resize-y`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-whatsapp hover:bg-whatsapp-hover flex min-h-13 w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-base leading-tight font-semibold text-neutral-950 transition-colors"
      >
        <WhatsAppIcon className="size-5 shrink-0" aria-hidden="true" />
        {t('submit')}
      </button>

      <p className="text-muted-foreground text-center text-sm">
        {t('privacyNote')}
      </p>

      {/*
        Confirmation panel.

        aria-live so the handoff is announced rather than only shown, and it
        carries the WhatsApp link explicitly: if the automatic navigation is
        blocked (in-app browsers, popup blockers, a desktop with no WhatsApp
        Web session) the customer still has a control to press instead of a
        dead end.
      */}
      {submitted && (
        <div
          aria-live="polite"
          className="border-primary-600 bg-primary-50 dark:bg-primary-950 space-y-3 rounded-2xl border p-5 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-semibold">
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
            {t('redirecting')}
          </p>

          <a
            href={whatsappUrl}
            className="text-primary-900 dark:text-primary-200 inline-flex min-h-11 items-center justify-center font-semibold underline underline-offset-4"
          >
            {t('openManually')}
          </a>

          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 text-sm underline underline-offset-4"
            >
              <CalendarPlus className="size-4 shrink-0" aria-hidden="true" />
              {t('addToCalendar')}
            </a>
          )}
        </div>
      )}
    </form>
  );
}
