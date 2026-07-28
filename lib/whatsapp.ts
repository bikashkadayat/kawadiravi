/**
 * ★ The only place a `wa.me` URL is constructed.
 *
 * Keeping this in one function means the number can never go stale in a
 * forgotten corner of the site, and every entry point gets the same
 * URL-encoding treatment (Nepali text in a prefilled message MUST be encoded).
 */

import { siteConfig } from '@/lib/site-config';

/**
 * Build a WhatsApp deep link with an optional prefilled message.
 *
 * `https://wa.me/<number>` is used rather than `api.whatsapp.com` because it
 * hands off to the installed app on mobile and to WhatsApp Web on desktop
 * without an interstitial.
 */
export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  // Callers that know the active locale pass the translated message; anything
  // else falls back to siteConfig.whatsappMessage so a WhatsApp link is never
  // opened with an empty compose box.
  const text = (message ?? siteConfig.whatsappMessage).trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Compose the lead-form message. Empty fields are dropped rather than sent as
 * blank lines, so a half-filled form still produces a clean message.
 */
export function buildLeadMessage(input: {
  intro: string;
  labels: { name: string; phone: string; scrapType: string; message: string };
  values: {
    name?: string;
    phone?: string;
    scrapType?: string;
    message?: string;
  };
}): string {
  const { intro, labels, values } = input;

  const lines = [
    values.name && `${labels.name}: ${values.name}`,
    values.phone && `${labels.phone}: ${values.phone}`,
    values.scrapType && `${labels.scrapType}: ${values.scrapType}`,
    values.message && `${labels.message}: ${values.message}`,
  ].filter(Boolean);

  return [intro, ...lines].join('\n');
}
