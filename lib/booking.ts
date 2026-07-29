/**
 * Booking domain: options, validation, and the two URLs a booking produces.
 *
 * Deliberately free of React so the message format can be reasoned about (and
 * changed) without touching the form. `BookingForm` owns state and markup;
 * everything here is a pure function of the submitted values.
 *
 * NO BACKEND. A booking is never stored anywhere — it is turned into a
 * WhatsApp deep link and handed to the customer's own WhatsApp client. That is
 * what keeps this compatible with `output: 'export'` on GitHub Pages, and it
 * also means the site holds no personal data at rest.
 */

import { siteConfig } from '@/lib/site-config';

/* ------------------------------------------------------------------------ */
/* Options                                                                   */
/* ------------------------------------------------------------------------ */

export interface BookingOption {
  id: string;
  labelEn: string;
  labelNe: string;
}

/**
 * Scrap types offered as checkboxes.
 *
 * Intentionally NOT derived from `data/rates.json`. That file lists 32 priced
 * line items ("Rusted iron", "Stainless steel 202") which is a pricing table,
 * not a picker — presenting 32 checkboxes on a phone would be hostile. These
 * are the coarse buckets a customer actually thinks in, and 'other' plus the
 * notes field catches anything missing.
 */
export const SCRAP_TYPES: BookingOption[] = [
  { id: 'iron', labelEn: 'Iron', labelNe: 'फलाम' },
  { id: 'steel', labelEn: 'Steel', labelNe: 'स्टिल' },
  { id: 'copper', labelEn: 'Copper', labelNe: 'तामा' },
  { id: 'brass', labelEn: 'Brass', labelNe: 'पित्तल' },
  { id: 'aluminium', labelEn: 'Aluminium', labelNe: 'एल्मुनियम' },
  { id: 'plastic', labelEn: 'Plastic', labelNe: 'प्लास्टिक' },
  { id: 'paper', labelEn: 'Paper', labelNe: 'कागज' },
  { id: 'newspaper', labelEn: 'Newspaper', labelNe: 'पुरानो पत्रिका' },
  { id: 'ewaste', labelEn: 'E-waste', labelNe: 'इ-वेस्ट' },
  { id: 'laptop', labelEn: 'Laptop', labelNe: 'ल्यापटप' },
  { id: 'mobile', labelEn: 'Mobile', labelNe: 'मोबाइल' },
  { id: 'battery', labelEn: 'Battery', labelNe: 'ब्याट्री' },
  { id: 'other', labelEn: 'Other', labelNe: 'अन्य' },
];

/**
 * Pickup windows.
 *
 * `startHour`/`endHour` are 24h local time and exist only so the optional
 * calendar event can be given a real duration. They are the same numbers the
 * label states, so the two can never disagree.
 *
 * NOTE (Bikash): the evening slot runs to 19:00, which matches Sunday–Friday
 * in `siteConfig.hours` but is two hours past the 17:00 Saturday close. If you
 * do not want Saturday evening bookings, drop this slot or add a weekday check.
 */
export const TIME_SLOTS: (BookingOption & {
  startHour: number;
  endHour: number;
})[] = [
  {
    id: 'morning',
    labelEn: 'Morning (8–11 AM)',
    labelNe: 'बिहान (८–११ बजे)',
    startHour: 8,
    endHour: 11,
  },
  {
    id: 'midday',
    labelEn: 'Midday (11 AM–2 PM)',
    labelNe: 'मध्यदिन (११–२ बजे)',
    startHour: 11,
    endHour: 14,
  },
  {
    id: 'afternoon',
    labelEn: 'Afternoon (2–5 PM)',
    labelNe: 'दिउँसो (२–५ बजे)',
    startHour: 14,
    endHour: 17,
  },
  {
    id: 'evening',
    labelEn: 'Evening (5–7 PM)',
    labelNe: 'साँझ (५–७ बजे)',
    startHour: 17,
    endHour: 19,
  },
];

/** Area dropdown, reusing the single source of truth for the service area. */
export const AREAS: BookingOption[] = siteConfig.coverage.map((area) => ({
  id: area.nameEn,
  labelEn: area.nameEn,
  labelNe: area.nameNe,
}));

/* ------------------------------------------------------------------------ */
/* Values + validation                                                       */
/* ------------------------------------------------------------------------ */

export interface BookingValues {
  name: string;
  phone: string;
  address: string;
  area: string;
  scrapTypes: string[];
  weight: string;
  date: string; // yyyy-mm-dd, straight from <input type="date">
  timeSlot: string;
  notes: string;
}

export type BookingField = 'name' | 'phone' | 'address' | 'date' | 'timeSlot';

export type BookingErrors = Partial<Record<BookingField, string>>;

/** Local calendar date as yyyy-mm-dd. `toISOString` would shift to UTC and, in
 *  Nepal's +05:45 offset, hand back *yesterday* for any time before 05:45. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * A Nepali mobile number is ten digits (98…/97…/96…). Anything the user typed
 * as spacing or punctuation is stripped before counting, so "984-123 4567"
 * passes — rejecting it would be pedantry, not validation.
 */
export function normalisePhone(input: string): string {
  return input.replace(/[^\d]/g, '');
}

/**
 * Validate the required fields.
 *
 * Returns a map of field → message key. The FORM resolves those keys to
 * translated strings, so this stays free of any i18n dependency.
 */
export function validateBooking(
  values: BookingValues,
  today: string = todayIso(),
): BookingErrors {
  const errors: BookingErrors = {};

  if (!values.name.trim()) errors.name = 'errName';

  const digits = normalisePhone(values.phone);
  if (!digits) errors.phone = 'errPhoneRequired';
  else if (digits.length !== 10) errors.phone = 'errPhoneLength';

  if (!values.address.trim()) errors.address = 'errAddress';

  if (!values.date) errors.date = 'errDate';
  // String compare is safe and timezone-proof for yyyy-mm-dd, which sorts
  // lexicographically in the same order it sorts chronologically.
  else if (values.date < today) errors.date = 'errDatePast';

  if (!values.timeSlot) errors.timeSlot = 'errTimeSlot';

  return errors;
}

/* ------------------------------------------------------------------------ */
/* Message                                                                   */
/* ------------------------------------------------------------------------ */

const NE_WEEKDAYS = [
  'आइतबार',
  'सोमबार',
  'मङ्गलबार',
  'बुधबार',
  'बिहिबार',
  'शुक्रबार',
  'शनिबार',
];

/** yyyy-mm-dd → "2026-08-05, बुधबार". Parsed as local, not UTC. */
function formatDateNe(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const weekday = NE_WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${iso}, ${weekday}`;
}

function labelNe(options: BookingOption[], id: string): string {
  return options.find((o) => o.id === id)?.labelNe ?? id;
}

/**
 * Compose the WhatsApp booking message.
 *
 * ALWAYS NEPALI, on both locales, for the same reason `siteConfig.
 * whatsappMessage` is: nobody browsing the site reads this text. It lands in
 * the shop's inbox and is read by whoever dispatches the pickup vehicle, and
 * they work in Nepali. An English visitor still fills in an English form.
 *
 * Empty optional fields are dropped rather than sent as "⚖️ अनुमानित तौल: " —
 * a half-filled form still produces a message that reads like a person wrote
 * it.
 */
export function buildBookingMessage(values: BookingValues): string {
  const location = [values.address.trim(), values.area]
    .filter(Boolean)
    .join(', ');

  const scrap = values.scrapTypes
    .map((id) => labelNe(SCRAP_TYPES, id))
    .join(', ');

  const lines = [
    `👤 नाम: ${values.name.trim()}`,
    `📞 फोन: ${normalisePhone(values.phone)}`,
    `📍 ठेगाना: ${location}`,
    scrap && `♻️ सामान: ${scrap}`,
    values.weight.trim() && `⚖️ अनुमानित तौल: ${values.weight.trim()}`,
    `📅 मिति: ${formatDateNe(values.date)}`,
    `🕐 समय: ${labelNe(TIME_SLOTS, values.timeSlot)}`,
    values.notes.trim() && `📝 टिप्पणी: ${values.notes.trim()}`,
  ].filter(Boolean);

  return [
    `नमस्ते ${siteConfig.name}! 🙏`,
    'मलाई कवाडी पिकअप बुक गर्नु छ।',
    '',
    ...lines,
  ].join('\n');
}

/* ------------------------------------------------------------------------ */
/* Optional calendar event                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Google Calendar "add event" template URL — client-side only, no API key and
 * no backend. Purely a convenience so the customer remembers to be home.
 *
 * `ctz=Asia/Kathmandu` matters: without it Google interprets the naked
 * timestamps in the viewer's own timezone, so a customer whose laptop is set
 * to UTC would get an event 5h45m off.
 */
export function buildCalendarUrl(values: BookingValues): string | null {
  const slot = TIME_SLOTS.find((s) => s.id === values.timeSlot);
  if (!slot || !values.date) return null;

  const stamp = (hour: number) =>
    `${values.date.replace(/-/g, '')}T${String(hour).padStart(2, '0')}0000`;

  const details = [
    `${siteConfig.name} — कवाडी पिकअप`,
    `फोन: ${siteConfig.phoneDisplay}`,
    values.scrapTypes.length
      ? `सामान: ${values.scrapTypes.map((id) => labelNe(SCRAP_TYPES, id)).join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${siteConfig.name} Pickup`,
    dates: `${stamp(slot.startHour)}/${stamp(slot.endHour)}`,
    details,
    location: [values.address.trim(), values.area, 'Kathmandu, Nepal']
      .filter(Boolean)
      .join(', '),
    ctz: 'Asia/Kathmandu',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
