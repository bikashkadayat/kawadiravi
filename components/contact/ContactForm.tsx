'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import { RATE_CATEGORIES } from '@/lib/rates';
import { buildLeadMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/BrandIcons';

/**
 * Lead form that opens WhatsApp with the message pre-composed.
 *
 * Nothing is submitted to a server and nothing is stored: on submit we build a
 * `wa.me` deep link and hand off. That means no backend, no third-party form
 * service, no privacy policy obligations for stored data — and the lead lands
 * in the inbox the owner already checks all day.
 *
 * Validation is deliberately light. A scrap seller filling this in on a phone
 * should not be blocked by format rules; we only require enough to be able to
 * reply, and the browser's own `required` handling does the rest.
 */
export function ContactForm() {
  const t = useTranslations('contact');
  const tRates = useTranslations('rates');

  const nameId = useId();
  const phoneId = useId();
  const typeId = useId();
  const messageId = useId();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [scrapType, setScrapType] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Need a name plus at least one way to act on the enquiry.
    if (!name.trim() || (!phone.trim() && !message.trim())) {
      setError(true);
      return;
    }
    setError(false);

    const text = buildLeadMessage({
      intro: t('formIntro'),
      labels: {
        name: t('formName'),
        phone: t('formPhone'),
        scrapType: t('formScrapType'),
        message: t('formMessage'),
      },
      values: { name, phone, scrapType, message },
    });

    // `noopener` matters: without it the opened tab can reach back via
    // window.opener.
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
  }

  const fieldClass =
    'bg-background focus:border-primary-600 mt-1.5 w-full rounded-xl border px-4 py-3 text-base outline-none';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={nameId} className="text-sm font-semibold">
          {t('formName')}
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('formNamePlaceholder')}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor={phoneId} className="text-sm font-semibold">
          {t('formPhone')}
        </label>
        <input
          id={phoneId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('formPhonePlaceholder')}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor={typeId} className="text-sm font-semibold">
          {t('formScrapType')}{' '}
          <span className="text-muted-foreground font-normal">
            ({t('formOptional')})
          </span>
        </label>
        <select
          id={typeId}
          value={scrapType}
          onChange={(e) => setScrapType(e.target.value)}
          className={fieldClass}
        >
          <option value="">{t('formScrapTypePlaceholder')}</option>
          {RATE_CATEGORIES.map((category) => (
            <option key={category} value={tRates(`categories.${category}`)}>
              {tRates(`categories.${category}`)}
            </option>
          ))}
          <option value={t('formScrapTypeOther')}>
            {t('formScrapTypeOther')}
          </option>
        </select>
      </div>

      <div>
        <label htmlFor={messageId} className="text-sm font-semibold">
          {t('formMessage')}
        </label>
        <textarea
          id={messageId}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('formMessagePlaceholder')}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* Announced to screen readers the moment it appears. */}
      {error && (
        <p role="alert" className="text-destructive text-sm font-medium">
          {t('formRequired')}
        </p>
      )}

      <button
        type="submit"
        className="bg-whatsapp hover:bg-whatsapp-hover flex h-13 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-neutral-950 transition-colors"
      >
        <WhatsAppIcon className="size-5" aria-hidden="true" />
        {t('formSubmit')}
      </button>
    </form>
  );
}
