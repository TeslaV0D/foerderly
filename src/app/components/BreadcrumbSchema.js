'use client';

/**
 * FÖRDERLY – BreadcrumbSchema (JSON-LD)
 * Injiziert strukturierte Daten für Google Rich Snippets.
 * Zeigt Navigation Trail in Suchergebnissen.
 *
 * Usage:
 *   <BreadcrumbSchema items={[
 *     { name: 'Startseite', url: 'https://foerderly.com' },
 *     { name: 'Quellen', url: 'https://foerderly.com/quellen' },
 *   ]} />
 */
export default function BreadcrumbSchema({ items }) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
