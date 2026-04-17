import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 64,
        paddingTop: 28,
        paddingBottom: 24,
        borderTop: '1px solid var(--border2)',
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: 'var(--muted)',
          maxWidth: 520,
          margin: '0 auto',
          textAlign: 'center',
          lineHeight: 1.55,
        }}
      >
        Förderly – Daten basieren auf öffentlichen Informationen der Förderdatenbank des Bundes.
        Keine Gewähr für Vollständigkeit oder Aktualität.
      </p>
      <div
        className="flex items-center justify-center"
        style={{ gap: 14, marginTop: 14 }}
      >
        <FooterLink href="/impressum">Impressum</FooterLink>
        <Dot />
        <FooterLink href="/datenschutz">Datenschutz</FooterLink>
        <Dot />
        <FooterLink href="/quellen">Quellen</FooterLink>
      </div>
      <style>{`
        .footer-link { color: var(--muted); transition: color 0.2s; }
        .footer-link:hover { color: var(--text); }
      `}</style>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} className="footer-link" style={{ fontSize: 12, textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

function Dot() {
  return <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>;
}
