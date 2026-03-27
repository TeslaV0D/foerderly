// src/app/programme/[id]/page.js
// v5.2.1: Layout-Fixes – Sidebar rechts (Summe, Kontakt, Ähnliche Programme),
//         größere Beschreibung, Branchen mittig

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProgrammeById, getSimilarProgrammes, getTopProgrammeIds } from '@/lib/search';
import { BUNDESLAENDER, PHASEN, GROESSEN, FOERDERARTEN, formatEuro } from '@/lib/constants';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BreadcrumbSchema from '../../components/BreadcrumbSchema';
import ProgrammeSchema from '../../components/ProgrammeSchema';
import DeadlineIndicator from '../../components/DeadlineIndicator';
import ContactWidget from '../../components/ContactWidget';
import ShareButtons from '../../components/ShareButtons';
import FreshnessIndicator from '../../components/FreshnessIndicator';

export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const ids = await getTopProgrammeIds(100);
    return ids.map(id => ({ id: String(id) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const programme = await getProgrammeById(id);
  if (!programme) return { title: 'Programm nicht gefunden' };

  const title = programme.kurzname
    ? `${programme.kurzname} – ${programme.name}`
    : programme.name;

  const desc = programme.description_short || programme.beschreibung?.slice(0, 160) || `Förderprogramm: ${programme.name}`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://foerderly.com/programme/${programme.id}` },
    openGraph: {
      title,
      description: desc,
      url: `https://foerderly.com/programme/${programme.id}`,
      type: 'article',
    },
  };
}

export default async function ProgrammeDetailPage({ params }) {
  const { id } = await params;
  const programme = await getProgrammeById(id);
  if (!programme) notFound();

  const similar = await getSimilarProgrammes(programme, 6);
  const art = FOERDERARTEN[programme.foerderart] || FOERDERARTEN.zuschuss;
  const hasVolumen = programme.volumen_max_eur > 0;
  const pageUrl = `https://foerderly.com/programme/${programme.id}`;

  // Vollbeschreibung: description_full > beschreibung
  const fullDescription = programme.description_full || programme.beschreibung;

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <Link href="/search" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Suche
        </Link>

        {/* ═══ HEADER ═══ */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium badge-${programme.foerderart}`}>
              {art.emoji} {art.label}
            </span>
            <DeadlineIndicator antragsfrist={programme.antragsfrist} hatDeadline={programme.hat_deadline} />
          </div>

          {programme.kurzname && programme.kurzname !== programme.name && (
            <p className="text-sm font-semibold mb-1 gradient-text">{programme.kurzname}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {programme.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{programme.foerdergeber}</p>

          <div className="flex items-center gap-3 mt-3">
            <ShareButtons url={pageUrl} title={programme.name} />
            <FreshnessIndicator date={programme.aktualisiert_am} />
          </div>
        </div>

        {/* ═══ 2-COLUMN LAYOUT: Content links, Sidebar rechts ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Zielgruppen (Badges, oben) */}
            <TagGroup title="Zielgruppen"
              items={programme.zielgruppen_erweitert || []}
              colorStyle={{ background: 'rgba(96,165,250,0.1)', color: '#93c5fd' }} />

            {/* 2. Besonderheiten (oben) */}
            {(programme.besonderheiten || []).length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Besonderheiten & Hinweise</h2>
                <div className="space-y-1.5">
                  {(programme.besonderheiten || []).map((item, i) => (
                    <div key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent-text)' }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Details-Grid (flat) */}
            <section>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoCard label="Förderart" value={`${art.emoji} ${art.label}`} />
                {programme.eigenanteil_prozent > 0 && (
                  <InfoCard label="Eigenanteil" value={`${programme.eigenanteil_prozent}%`} />
                )}
                {programme.foerderquote && (
                  <InfoCard label="Förderquote" value={`bis ${programme.foerderquote}%`} />
                )}
                {programme.bearbeitungszeit && (
                  <InfoCard label="Bearbeitungszeit" value={programme.bearbeitungszeit} />
                )}
                {programme.antragsfrist && (
                  <InfoCard label="Antragsfrist" value={programme.antragsfrist} />
                )}
              </div>
            </section>

            {/* 4. Tags: Fördergebiet, Phasen, Größen, Finanzierung */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TagGroup title="Fördergebiet"
                items={(programme.bundeslaender || []).map(bl => bl === 'BUND' ? 'Bundesweit' : (BUNDESLAENDER[bl] || bl))}
                colorStyle={{ background: 'var(--violet-muted)', color: 'var(--violet-accent)' }} />
              <TagGroup title="Geeignete Phasen"
                items={(programme.phasen || []).map(ph => PHASEN[ph] || ph)}
                colorStyle={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }} />
              <TagGroup title="Unternehmensgrößen"
                items={(programme.groessen || []).map(gr => GROESSEN[gr] || gr)}
                colorStyle={{ background: 'rgba(244,114,182,0.1)', color: '#f472b6' }} />
              <TagGroup title="Finanzierungsform"
                items={programme.finanzierungsform_erweitert || []}
                colorStyle={{ background: 'rgba(167,139,250,0.1)', color: '#c4b5fd' }} />
            </div>

            {/* 5. Branchen (MITTIG, volle Breite im Content-Bereich) */}
            <TagGroup title="Branchen"
              items={(programme.branchen || []).map(br => br.name)}
              colorStyle={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }} />

            {/* 6. Beschreibung (VOLLSTÄNDIG, GRÖßERE Schrift: text-base statt text-sm) */}
            {fullDescription && (
              <section>
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Beschreibung</h2>
                <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--bg-elevated)' }}>
                  <p className="text-base leading-7 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {fullDescription}
                  </p>
                </div>
              </section>
            )}

            {/* 7. Rechtsgrundlagen */}
            {(programme.rechtsgrundlagen || []).length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Rechtsgrundlagen</h2>
                <div className="space-y-1">
                  {(programme.rechtsgrundlagen || []).map((rg, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rg}</p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (1/3, sticky) ── */}
          <div className="lg:col-span-1">
            <div
              className="sticky space-y-4"
              style={{
                top: 'calc(var(--header-height, 57px) + 1.5rem)',
                maxHeight: 'calc(100vh - var(--header-height, 57px) - 3rem)',
                overflowY: 'auto',
              }}
            >
              {/* Förderhöhe Box */}
              {hasVolumen && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--accent-muted)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-text)' }}>Förderhöhe</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent-text)' }}>
                    bis zu {formatEuro(programme.volumen_max_eur)}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    {programme.foerderquote && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Förderquote: bis {programme.foerderquote}%
                      </p>
                    )}
                    {programme.eigenanteil_prozent > 0 && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Eigenanteil: {programme.eigenanteil_prozent}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                {programme.url_antrag && (
                  <a href={programme.url_antrag} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#0f0f13' }}>
                    Zum Antrag →
                  </a>
                )}
                {programme.url_quelle && (
                  <a href={programme.url_quelle} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    Originalquelle
                  </a>
                )}
              </div>

              {/* Kontakt-Widget */}
              <ContactWidget kontakte={programme.kontakte} />

              {/* Ähnliche Programme */}
              {similar?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Ähnliche Programme
                  </h3>
                  <div className="space-y-3">
                    {similar.filter(p => p.id !== programme.id).slice(0, 4).map(prog => {
                      const simArt = FOERDERARTEN[prog.foerderart] || FOERDERARTEN.zuschuss;
                      return (
                        <Link key={prog.id} href={`/programme/${prog.id}`}
                          className="block rounded-xl p-3 transition-all"
                          style={{ background: 'var(--bg-elevated)' }}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium badge-${prog.foerderart}`}>
                              {simArt.emoji} {simArt.label}
                            </span>
                            {prog.volumen_max_eur > 0 && (
                              <span className="text-[10px] font-semibold" style={{ color: 'var(--accent-text)' }}>
                                bis zu {formatEuro(prog.volumen_max_eur)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium line-clamp-2 mt-1" style={{ color: 'var(--text-primary)' }}>
                            {prog.kurzname || prog.name}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {prog.foerdergeber}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
      <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

function TagGroup({ title, items, colorStyle }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {safeItems.map((item, i) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize" style={colorStyle}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
