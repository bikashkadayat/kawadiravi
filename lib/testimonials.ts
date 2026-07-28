/**
 * ⚠️ PLACEHOLDER CONTENT — these are illustrative, not real customers.
 *
 * Replace every entry with genuine, permission-granted reviews before launch.
 * Publishing invented testimonials as if they were real is misleading to
 * customers, and fabricated `Review` markup can get a site penalised by
 * Google. For that reason M6 will NOT emit Review/AggregateRating JSON-LD
 * for this data — only the LocalBusiness schema, which makes no rating claim.
 *
 * Kept in TypeScript rather than data/ because, unlike rates, this is not
 * something the owner edits weekly.
 */

import type { Testimonial } from '@/types';

export const testimonials: Testimonial[] = [
  {
    id: 'sample-1',
    nameEn: 'Sample Customer',
    nameNe: 'नमुना ग्राहक',
    areaEn: 'Lalitpur',
    areaNe: 'ललितपुर',
    quoteEn:
      'They arrived within a few hours, weighed everything in front of me and paid immediately. No haggling at the last minute.',
    quoteNe:
      'केही घण्टामै आइपुगे, सबै मेरै अगाडि तौले र तुरुन्तै भुक्तानी गरे। अन्तिम समयमा कुनै मोलमोलाइ भएन।',
    rating: 5,
  },
  {
    id: 'sample-2',
    nameEn: 'Sample Customer',
    nameNe: 'नमुना ग्राहक',
    areaEn: 'Kathmandu',
    areaNe: 'काठमाडौं',
    quoteEn:
      'We cleared an entire office store room — old monitors, cables and paper. They carried everything down themselves.',
    quoteNe:
      'हामीले पूरै कार्यालयको भण्डार कोठा खाली गर्‍यौं — पुराना मोनिटर, तार र कागज। सबै उनीहरू आफैंले तल झारे।',
    rating: 5,
  },
  {
    id: 'sample-3',
    nameEn: 'Sample Customer',
    nameNe: 'नमुना ग्राहक',
    areaEn: 'Bhaktapur',
    areaNe: 'भक्तपुर',
    quoteEn:
      'The rate they quoted on the phone was the rate I got. That is rarer than it should be.',
    quoteNe:
      'फोनमा भनेकै दर मैले पाएँ। यस्तो हुनु जति सामान्य हुनुपर्ने हो, त्यति छैन।',
    rating: 5,
  },
];
