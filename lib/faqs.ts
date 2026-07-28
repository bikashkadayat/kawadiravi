/**
 * FAQ content for the services page.
 *
 * Kept in TypeScript rather than the message files because each entry is a
 * question/answer *pair* in two languages — splitting that across en.json and
 * ne.json makes it easy to translate one half and forget the other. Here a
 * missing translation is a TypeScript error.
 *
 * This same array feeds both the visible accordion and the FAQPage JSON-LD, so
 * the structured data can never claim something the page does not show.
 */

import type { FaqItem } from '@/types';

export const faqs: FaqItem[] = [
  {
    id: 'minimum-quantity',
    questionEn: 'Is there a minimum quantity for pickup?',
    questionNe: 'पिकअपका लागि न्यूनतम परिमाण चाहिन्छ?',
    answerEn:
      'For most materials there is no strict minimum, but for very small loads it is worth calling first — we may combine your pickup with another one nearby so the trip makes sense for both of us.',
    answerNe:
      'धेरैजसो सामानका लागि कडा न्यूनतम छैन, तर एकदमै थोरै भए पहिले फोन गर्नु राम्रो — हामी तपाईंको पिकअपलाई नजिकैको अर्कोसँग मिलाउन सक्छौं।',
  },
  {
    id: 'pickup-cost',
    questionEn: 'Do you charge for pickup?',
    questionNe: 'पिकअपका लागि शुल्क लाग्छ?',
    answerEn:
      'No. Pickup is free anywhere in our coverage area, including carrying items down from upper floors. The rate you are quoted is the rate you are paid.',
    answerNe:
      'पर्दैन। हाम्रो सेवा क्षेत्रभित्र जहाँसुकै पिकअप निःशुल्क छ, माथिल्लो तलाबाट सामान झार्ने काम पनि। तपाईंलाई भनिएकै दर तपाईंले पाउनुहुन्छ।',
  },
  {
    id: 'how-fast',
    questionEn: 'How quickly can you come?',
    questionNe: 'तपाईंहरू कति छिटो आउन सक्नुहुन्छ?',
    answerEn:
      'Often the same day if you call in the morning, and usually within 24 hours otherwise. Large or commercial loads may need scheduling a day ahead so we bring the right vehicle.',
    answerNe:
      'बिहान फोन गर्नुभयो भने प्रायः सोही दिन, नत्र सामान्यतया २४ घण्टाभित्र। ठूलो वा व्यावसायिक परिमाणका लागि उपयुक्त सवारी ल्याउन एक दिन अगाडि समय मिलाउनुपर्ने हुन सक्छ।',
  },
  {
    id: 'payment-method',
    questionEn: 'How do you pay?',
    questionNe: 'भुक्तानी कसरी गर्नुहुन्छ?',
    answerEn:
      'Cash on the spot, in full, before we leave. For larger commercial loads we can also arrange a bank transfer or digital wallet payment if you prefer.',
    answerNe:
      'हामी जानुअघि नै पूरा रकम नगदमा। ठूलो व्यावसायिक परिमाणका लागि चाहनुहुन्छ भने बैंक ट्रान्सफर वा डिजिटल वालेटबाट पनि मिलाउन सकिन्छ।',
  },
  {
    id: 'weighing',
    questionEn: 'How do I know the weight is accurate?',
    questionNe: 'तौल सही छ भनेर कसरी थाहा पाउने?',
    answerEn:
      'Everything is weighed in front of you on a calibrated scale, and you see the reading before any money changes hands. If you are not satisfied with the weight, you are free to stop the sale.',
    answerNe:
      'सबै सामान मिलाइएको तराजुमा तपाईंकै अगाडि तौलिन्छ, र पैसाको कारोबार हुनुअघि नै तपाईं रिडिङ देख्नुहुन्छ। तौलमा चित्त बुझेन भने बिक्री रोक्न तपाईं स्वतन्त्र हुनुहुन्छ।',
  },
  {
    id: 'rates-change',
    questionEn: 'Why do the rates on this site change?',
    questionNe: 'यो साइटका दर किन परिवर्तन हुन्छन्?',
    answerEn:
      'Scrap prices follow the metal and commodity markets, which move constantly. We update the published rates regularly, but always call or WhatsApp for the exact figure on the day you plan to sell.',
    answerNe:
      'कवाडीको मूल्य धातु तथा वस्तु बजारमा निर्भर हुन्छ, जुन निरन्तर परिवर्तन भइरहन्छ। हामी प्रकाशित दर नियमित अद्यावधिक गर्छौं, तर बेच्ने दिनको ठ्याक्कै दरका लागि सधैं फोन वा व्हाट्सएप गर्नुहोस्।',
  },
  {
    id: 'sorting',
    questionEn: 'Do I need to sort or clean the scrap first?',
    questionNe: 'कवाडी पहिले छुट्याउनु वा सफा गर्नुपर्छ?',
    answerEn:
      'Not at all — we sort on site. It does help if paper is dry and kept separate from wet waste, since damp paper weighs more but is worth less and we cannot pay the paper rate for it.',
    answerNe:
      'पर्दैन — हामी त्यहीँ छुट्याउँछौं। तर कागज सुक्खा राखेर भिजेको फोहोरबाट अलग राख्दा राम्रो हुन्छ, किनभने भिजेको कागजको तौल बढी भए पनि मूल्य कम हुन्छ।',
  },
  {
    id: 'ewaste-data',
    questionEn: 'What happens to the data on my old laptop or phone?',
    questionNe: 'मेरो पुरानो ल्यापटप वा फोनको डाटाको के हुन्छ?',
    answerEn:
      'We strongly recommend wiping or removing the storage yourself before handing a device over — that is the only way to be certain. Devices we buy are passed to registered e-waste handlers for dismantling, not resold as working units.',
    answerNe:
      'उपकरण दिनुअघि स्टोरेज आफैं मेटाउन वा निकाल्न हामी दृढ सिफारिस गर्छौं — निश्चित हुने एक मात्र उपाय त्यही हो। हामीले किनेका उपकरण चल्ने अवस्थामा पुनःबिक्री नगरी दर्ता भएका इ-वेस्ट प्रशोधकलाई विच्छेदनका लागि पठाइन्छ।',
  },
  {
    id: 'commercial',
    questionEn: 'Do you handle offices, factories and construction sites?',
    questionNe: 'कार्यालय, कारखाना र निर्माण स्थल पनि हेर्नुहुन्छ?',
    answerEn:
      'Yes. Commercial and industrial clearances are a large part of what we do, and we can provide a written quotation and invoice where your accounts department needs one.',
    answerNe:
      'हो। व्यावसायिक तथा औद्योगिक सरसफाइ हाम्रो कामको ठूलो हिस्सा हो, र तपाईंको लेखा विभागलाई चाहिएमा लिखित कोटेशन र बिल पनि उपलब्ध गराउँछौं।',
  },
  {
    id: 'not-accepted',
    questionEn: 'Is there anything you do not accept?',
    questionNe: 'तपाईंहरूले नलिने केही छ?',
    answerEn:
      'We do not take medical or biological waste, chemicals, paint, asbestos, gas cylinders, or anything explosive. Mixed household rubbish is also outside what we do — we buy recoverable material, not general waste.',
    answerNe:
      'हामी चिकित्सकीय वा जैविक फोहोर, रसायन, रङ, एस्बेस्टस, ग्यास सिलिन्डर, वा विस्फोटक पदार्थ लिँदैनौं। मिश्रित घरायसी फोहोर पनि हाम्रो कामभित्र पर्दैन — हामी पुनःप्रयोगयोग्य सामान किन्छौं, सामान्य फोहोर होइन।',
  },
  {
    id: 'coverage-outside',
    questionEn: 'What if I am outside Kathmandu Valley?',
    questionNe: 'म काठमाडौं उपत्यका बाहिर छु भने?',
    answerEn:
      'Call and ask. For a large enough load we do travel beyond the Valley; for smaller quantities it may not be practical, and we would rather tell you that honestly than waste your time.',
    answerNe:
      'फोन गरेर सोध्नुहोस्। पर्याप्त ठूलो परिमाण भए हामी उपत्यका बाहिर पनि जान्छौं; थोरै भए व्यावहारिक नहुन सक्छ, र त्यो कुरा हामी इमानदारीपूर्वक भन्न रुचाउँछौं।',
  },
  {
    id: 'booking',
    questionEn: 'How do I book a pickup?',
    questionNe: 'पिकअप कसरी बुक गर्ने?',
    answerEn:
      'Call or send a WhatsApp message with roughly what you have and your location. A photo helps us bring the right vehicle and give you a more accurate rate before we arrive.',
    answerNe:
      'तपाईंसँग के छ र कहाँ हुनुहुन्छ भनी फोन गर्नुहोस् वा व्हाट्सएप सन्देश पठाउनुहोस्। फोटो पठाउनुभयो भने उपयुक्त सवारी ल्याउन र आउनुअघि नै बढी सटीक दर भन्न सजिलो हुन्छ।',
  },
];
