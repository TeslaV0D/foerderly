'use client';

import { FOERDERARTEN } from '@/lib/constants';

/**
 * JSON-LD Schema für einzelne Förderprogramme.
 * Verwendet GovernmentService Schema.
 */
export default function ProgrammeSchema({ programme, url }) {
  if (!programme) return null;

  const art = FOERDERARTEN[programme.foerderart] || FOERDERARTEN.zuschuss;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: programme.name,
    alternateName: programme.kurzname || undefined,
    description: programme.beschreibung || undefined,
    url: url,
    provider: programme.foerdergeber ? {
      '@type': 'GovernmentOrganization',
      name: programme.foerdergeber,
    } : undefined,
    areaServed: (programme.bundeslaender || []).includes('BUND')
      ? { '@type': 'Country', name: 'Germany' }
      : {
          '@type': 'AdministrativeArea',
          name: (programme.bundeslaender || []).join(', '),
        },
    serviceType: art.label,
    ...(programme.url_antrag ? { potentialAction: {
      '@type': 'Action',
      name: 'Antrag stellen',
      url: programme.url_antrag,
    }} : {}),
  };

  // Entferne undefined Felder
  const cleaned = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleaned) }}
    />
  );
}
