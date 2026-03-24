/**
 * FÖRDERLY – Programm Detail-Seite (ISR)
 * /programme/[id]
 *
 * - Incremental Static Regeneration (24h revalidate)
 * - Top 100 bei Build (generateStaticParams)
 * - JSON-LD Schema
 * - Ähnliche Programme Widget
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProgrammeById, getSimilarProgrammes, getTopProgrammeIds } from '@/lib/search';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BreadcrumbSchema from '../../components/BreadcrumbSchema';
import ProgrammeSchema from '../../components/ProgrammeSchema';
import SimilarProgrammes from '../../components/SimilarProgrammes';
import DeadlineIndicator from '../../components/DeadlineIndicator';
import ContactWidget from '../../components/ContactWidget';
import DataQualityBadge from '../../components/DataQualityBadge';
import ShareButtons from '../../components/ShareButtons';
import FreshnessIndicator from '../../components/FreshnessIndicator';

// ISR: 24h Revalidation
export const revalidate = 86400;

// Top 100 Programme bei Build vorrendern
export async function generateStaticParams() {
  try {
    const ids = await getTopProgrammeIds(100);
    return ids.map(id => ({ id: String(id) }));
  } catch {
    return [];
  }
}

// Dynamic Metadata
export async function generateMetadata({ params }) {
  const { id } = await params;
  const programme = await getProgrammeById(id);
  if (!programme) return { title: 'Programm nicht gefunden' };

  const title = programme.kurzname
    ? `${programme.kurzname} – ${programme.name}`
    : programme.name;

  return {
    title,
    description: programme.beschreibung?.slice(0, 160) || `Förderprogramm: ${programme.name}`,
    alternates: {
      canonical: `https://foerderly.com/programme/${programme.id}`,
    },
    openGraph: {
      title,
      description: programme.beschreibung?.slice(0, 160),
      url: `https://foerderly.com/programme/${programme.id}`,
      type: 'article',
    },
  };
}

export default async function ProgrammeDetailPage({ params }) {
  const { id } = await params;
  const programme = await getProgrammeById(id);

  if (!programme) notFound();

  const similar = await getSimilarProgrammes(programme, 4);

  const art = FOERDERARTEN[programme.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programme.volumen_min_eur || programme.volumen_max_eur;
  const pageUrl = `https://foerderly.com/programme/${programme.id}`;

  const breadcrumbs = [
    { name: 'Startseite', url: 'https://foerderly.com' },
    { name: 'Förderprogramme', url: 'https://foerderly.com/search' },
    { name: programme.kurzname || programme.name, url: pageUrl },
  ];

  return (
    <main className="min-h-screen relative z-10">
      <BreadcrumbSchema items={breadcrumbs} />
      <ProgrammeSchema programme={programme} url={pageUrl} />
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        {/* Back Link */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Suche
        </Link>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium badge-${programme.foerderart}`}>
              {art.emoji} {art.label}
            </span>
            <DataQualityBadge quality={programme.datenqualitaet} />
            <DeadlineIndicator antragsfrist={programme.antragsfrist} hatDeadline={programme.hat_deadline} />
          </div>

          {programme.kurzname && programme.kurzname !== programme.name && (
            <p className="text-sm font-semibold mb-1 gradient-text">{programme.kurzname}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {programme.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{programme.foerdergeber}</p>

          {/* Share + Freshness */}
          <div className="flex items-center gap-4 mt-4">
            <ShareButtons url={pageUrl} title={programme.name} />
            <FreshnessIndicator date={programme.aktualisiert_am} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Förderhöhe */}
            {hasVolumen && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--accent-muted)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-text)' }}>Förderhöhe</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--accent-text)' }}>
                  {programme.volumen_min_eur === programme.volumen_max_eur
                    ? formatEuro(programme.volumen_max_eur)
                    : `${formatEuro(programme.volumen_min_eur)} – ${formatEuro(programme.volumen_max_eur)}`}
                </p>
                <div className="flex gap-4 mt-2">
                  {programme.eigenanteil_prozent > 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Eigenanteil: {programme.eigenanteil_prozent}%
                    </p>
                  )}
                  {programme.foerderquote && (
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Förderquote: bis {programme.foerderquote}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Beschreibung */}
            {programme.beschreibung && (
              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Beschreibung</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {programme.beschreibung}
                </p>
              </section>
            )}

            {/* Besonderheiten */}
            {programme.besonderheiten?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Besonderheiten & Hinweise</h2>
                <div className="space-y-2">
                  {programme.besonderheiten.map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent-text)' }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rechtsgrundlagen */}
            {programme.rechtsgrundlagen?.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Rechtsgrundlagen</h2>
                <div className="space-y-1">
                  {programme.rechtsgrundlagen.map((rg, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rg}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Details Grid */}
            <section>
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoCard label="Förderart" value={`${art.emoji} ${art.label}`} />
                <InfoCard label="Eigenanteil" value={programme.eigenanteil_prozent > 0 ? `${programme.eigenanteil_prozent}%` : 'Keiner'} />
                {programme.bearbeitungszeit && (
                  <InfoCard label="Bearbeitungszeit" value={programme.bearbeitungszeit} />
                )}
                {programme.antragsfrist && (
                  <InfoCard label="Antragsfrist" value={programme.antragsfrist} />
                )}
              </div>
            </section>

            {/* Tags */}
            <section className="space-y-4">
              {programme.bundeslaender?.length > 0 && (
                <TagGroup
                  title="Fördergebiet"
                  items={programme.bundeslaender.map(bl => bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl))}
                  colorStyle={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }}
                />
              )}
              {programme.phasen?.length > 0 && (
                <TagGroup
                  title="Geeignete Phasen"
                  items={programme.phasen.map(ph => PHASEN[ph] || ph)}
                  colorStyle={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
                />
              )}
              {programme.groessen?.length > 0 && (
                <TagGroup
                  title="Unternehmensgrößen"
                  items={programme.groessen.map(gr => GROESSEN[gr] || gr)}
                  colorStyle={{ background: 'rgba(244,114,182,0.1)', color: '#f472b6' }}
                />
              )}
              {programme.branchen?.length > 0 && (
                <TagGroup
                  title="Branchen"
                  items={programme.branchen.map(br => br.name)}
                  colorStyle={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                />
              )}
              {programme.zielgruppen_erweitert?.length > 0 && (
                <TagGroup
                  title="Zielgruppen"
                  items={programme.zielgruppen_erweitert}
                  colorStyle={{ background: 'rgba(96,165,250,0.1)', color: '#93c5fd' }}
                />
              )}
              {programme.finanzierungsform_erweitert?.length > 0 && (
                <TagGroup
                  title="Finanzierungsform"
                  items={programme.finanzierungsform_erweitert}
                  colorStyle={{ background: 'rgba(167,139,250,0.1)', color: '#c4b5fd' }}
                />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA Buttons */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              {programme.url_antrag && (
                <a
                  href={programme.url_antrag}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}
                >
                  Zum Antrag →
                </a>
              )}
              {programme.url_quelle && (
                <a
                  href={programme.url_quelle}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Originalquelle
                </a>
              )}
            </div>

            {/* Kontakte */}
            <ContactWidget kontakte={programme.kontakte} />

            {/* Ähnliche Programme */}
            <SimilarProgrammes programmes={similar} currentId={programme.id} />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

// Helper Components (inline, da nur hier verwendet)
function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function TagGroup({ title, items, colorStyle }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize" style={colorStyle}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
