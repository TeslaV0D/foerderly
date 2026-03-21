'use client';

/**
 * FÖRDERLY – FAQSchema (JSON-LD)
 * Injiziert FAQ-strukturierte Daten für Google "People Also Ask".
 *
 * Usage:
 *   <FAQSchema faqs={[
 *     { question: 'Was ist...?', answer: 'Eine...' },
 *   ]} />
 */
export default function FAQSchema({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
