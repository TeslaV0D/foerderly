// src/app/programme/[id]/page.js
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
    return ids.map((id) => ({ id: String(id) }));
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

  const desc =
    programme.description_short ||
    programme.beschreibung?.slice(0, 160) ||
    `Förderprogramm: ${programme.name}`;

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

const VIOLET_FOERDERARTEN = new Set(['buergschaft', 'beteiligung']);

function getAccentVar(foerderart) {
  return VIOLET_FOERDERARTEN.has(foerderart) ? 'var(--accent2)' : 'var(--accent)';
}

export default async function ProgrammeDetailPage({ params }) {
  const { id } = await params;
  const programme = await getProgrammeById(id);
  if (!programme) notFound();

  const similar = await getSimilarProgrammes(programme, 6);
  const art = FOERDERARTEN[programme.foerderart] || FOERDERARTEN.zuschuss;
  const accent = getAccentVar(programme.foerderart);
  const hasVolumen = programme.volumen_max_eur > 0;
  const pageUrl = `https://foerderly.com/programme/${programme.id}`;
  const fullDescription = programme.description_full || programme.beschreibung;

  const breadcrumbs = [
    { name: 'Startseite', url: 'https://foerderly.com' },
    { name: 'Förderprogramme', url: 'https://foerderly.com/search' },
    { name: programme.kurzname || programme.name, url: pageUrl },
  ];

  const kenndaten = [
    {
      label: 'Förderbetrag',
      value: hasVolumen ? `bis ${formatEuro(programme.volumen_max_eur)}` : '—',
      accent: hasVolumen,
    },
    {
      label: 'Förderquote',
      value: programme.foerderquote ? `bis ${programme.foerderquote}%` : '—',
    },
    {
      label: 'Eigenanteil',
      value: programme.eigenanteil_prozent > 0 ? `${programme.eigenanteil_prozent}%` : '—',
    },
    {
      label: 'Antragsfrist',
      value: programme.antragsfrist || (programme.hat_deadline ? '—' : 'Laufend'),
    },
  ];

  return (
    <main className="min-h-screen relative z-10">
      <BreadcrumbSchema items={breadcrumbs} />
      <ProgrammeSchema programme={programme} url={pageUrl} />
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <Link href="/search" className="btn-ghost" style={{ marginBottom: 24 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Suche
        </Link>

        {/* ═══ TITLE BLOCK ═══ */}
        <section style={{ marginBottom: 32 }}>
          <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 18 }}>
            <span
              className="pill"
              style={{
                background: `color-mix(in oklch, ${accent} 14%, transparent)`,
                borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                color: accent,
              }}
            >
              {art.emoji} {art.label}
            </span>
            <DeadlineIndicator antragsfrist={programme.antragsfrist} hatDeadline={programme.hat_deadline} />
          </div>

          {programme.kurzname && programme.kurzname !== programme.name && (
            <p
              className="gradient-text"
              style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: '0.02em' }}
            >
              {programme.kurzname}
            </p>
          )}

          <h1
            style={{
              fontSize: 'clamp(32px, 4.5vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-1.5px',
              lineHeight: 1.05,
              color: 'var(--text)',
              marginBottom: 14,
            }}
          >
            {programme.name}
          </h1>

          <p style={{ fontSize: 15, color: 'var(--muted)' }}>{programme.foerdergeber}</p>

          <div className="flex items-center" style={{ gap: 14, marginTop: 18 }}>
            <ShareButtons url={pageUrl} title={programme.name} />
            <FreshnessIndicator date={programme.aktualisiert_am} />
          </div>
        </section>

        {/* ═══ KENNDATEN GRID (2x2) ═══ */}
        <section
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            marginBottom: 32,
          }}
        >
          {kenndaten.map((k) => (
            <div
              key={k.label}
              style={{
                background: 'var(--bg2)',
                border: '1.5px solid var(--border2)',
                borderRadius: 'var(--radius)',
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                {k.label}
              </p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: k.accent ? accent : 'var(--text)',
                  lineHeight: 1.15,
                }}
              >
                {k.value}
              </p>
            </div>
          ))}
        </section>

        {/* ═══ MOBILE: Action + Kontakt OBEN ═══ */}
        <div className="lg:hidden space-y-4" style={{ marginBottom: 24 }}>
          <ActionCard programme={programme} accent={accent} />
          <ContactWidget kontakte={programme.kontakte} />
        </div>

        {/* ═══ 2-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
          {/* ── LEFT (2/3) ── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Beschreibung */}
            {fullDescription && (
              <section
                style={{
                  background: 'var(--bg2)',
                  border: '1.5px solid var(--border2)',
                  borderRadius: 'var(--radius)',
                  padding: 28,
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.4px',
                    color: 'var(--text)',
                    marginBottom: 16,
                  }}
                >
                  Beschreibung
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'var(--muted)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {fullDescription}
                </p>
              </section>
            )}

            <TagGroup title="Zielgruppen" items={programme.zielgruppen_erweitert || []} accent="var(--accent)" />

            {(programme.besonderheiten || []).length > 0 && (
              <section>
                <SectionHeading>Besonderheiten & Hinweise</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(programme.besonderheiten || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--muted)' }}>
                      <span style={{ color: accent, fontWeight: 700 }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
              <TagGroup
                title="Fördergebiet"
                items={(programme.bundeslaender || []).map((bl) =>
                  bl === 'BUND' ? 'Bundesweit' : BUNDESLAENDER[bl] || bl
                )}
                accent="var(--accent2)"
              />
              <TagGroup
                title="Geeignete Phasen"
                items={(programme.phasen || []).map((ph) => PHASEN[ph] || ph)}
                accent="var(--accent)"
              />
              <TagGroup
                title="Unternehmensgrößen"
                items={(programme.groessen || []).map((gr) => GROESSEN[gr] || gr)}
                accent="var(--accent2)"
              />
              <TagGroup
                title="Finanzierungsform"
                items={programme.finanzierungsform_erweitert || []}
                accent="var(--accent)"
              />
            </div>

            <TagGroup title="Branchen" items={(programme.branchen || []).map((br) => br.name)} />

            {(programme.rechtsgrundlagen || []).length > 0 && (
              <section>
                <SectionHeading>Rechtsgrundlagen</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(programme.rechtsgrundlagen || []).map((rg, i) => (
                    <p key={i} style={{ fontSize: 14, color: 'var(--muted)' }}>
                      {rg}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (1/3, sticky) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div
              className="sticky"
              style={{
                top: 'calc(var(--header-height, 64px) + 1.5rem)',
                maxHeight: 'calc(100vh - var(--header-height, 64px) - 3rem)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <ActionCard programme={programme} accent={accent} />
              <ContactWidget kontakte={programme.kontakte} />
              {similar?.length > 0 && <SimilarSection similar={similar} programme={programme} />}
            </div>
          </div>
        </div>

        {similar?.length > 0 && (
          <div className="lg:hidden" style={{ marginTop: 24 }}>
            <SimilarSection similar={similar} programme={programme} />
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}

function SectionHeading({ children }) {
  return (
    <h2
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--muted)',
        marginBottom: 12,
      }}
    >
      {children}
    </h2>
  );
}

function ActionCard({ programme, accent }) {
  if (!programme.url_antrag && !programme.url_quelle) return null;
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {programme.url_antrag && (
        <a
          href={programme.url_antrag}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Zum Antrag →
        </a>
      )}
      {programme.url_quelle && (
        <a
          href={programme.url_quelle}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', color: accent, borderColor: `color-mix(in oklch, ${accent} 35%, transparent)` }}
        >
          Originalquelle ↗
        </a>
      )}
    </div>
  );
}

function SimilarSection({ similar, programme }) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: 20,
      }}
    >
      <SectionHeading>Ähnliche Programme</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {similar
          .filter((p) => p.id !== programme.id)
          .slice(0, 4)
          .map((prog) => {
            const simArt = FOERDERARTEN[prog.foerderart] || FOERDERARTEN.zuschuss;
            const simAccent = VIOLET_FOERDERARTEN.has(prog.foerderart) ? 'var(--accent2)' : 'var(--accent)';
            return (
              <Link
                key={prog.id}
                href={`/programme/${prog.id}`}
                style={{
                  display: 'block',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  borderRadius: 12,
                  padding: 12,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 100,
                      background: `color-mix(in oklch, ${simAccent} 14%, transparent)`,
                      color: simAccent,
                    }}
                  >
                    {simArt.emoji} {simArt.label}
                  </span>
                  {prog.volumen_max_eur > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: simAccent, whiteSpace: 'nowrap' }}>
                      bis {formatEuro(prog.volumen_max_eur)}
                    </span>
                  )}
                </div>
                <p
                  className="line-clamp-2"
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}
                >
                  {prog.kurzname || prog.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{prog.foerdergeber}</p>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

function TagGroup({ title, items, accent = 'var(--accent)' }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!safeItems.length) return null;
  return (
    <div>
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-wrap" style={{ gap: 6 }}>
        {safeItems.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: 100,
              background: `color-mix(in oklch, ${accent} 10%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent} 22%, transparent)`,
              color: accent,
              textTransform: 'capitalize',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
