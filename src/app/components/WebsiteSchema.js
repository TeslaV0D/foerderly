'use client';

/**
 * FÖRDERLY – WebsiteSchema (JSON-LD)
 * Organisation + WebSite-Schema für Google Knowledge Panel.
 * Wird einmalig im Root Layout eingebunden.
 */
export default function WebsiteSchema() {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Förderly',
      url: 'https://foerderly.com',
      description: 'Finde in Sekunden die passenden Förderprogramme für dein Unternehmen. Über 2.000 Programme von Bund, Ländern und EU.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://foerderly.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Förderly',
      url: 'https://foerderly.com',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'anton.mischenko321@proton.me',
        contactType: 'customer support',
        availableLanguage: 'German',
      },
    },
  ];

  return (
    <>
      {schema.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
