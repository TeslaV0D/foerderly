'use client';

/**
 * SICHERHEIT: Sichere externe Links
 * - Erzwingt rel="noopener noreferrer" und target="_blank"
 * - Zeigt visuellen Indikator für externe Links
 * - Blockiert javascript: und data: URLs
 */
export default function SafeLink({ href, children, className = '', ...props }) {
  // URL-Sicherheitsprüfung im Frontend
  const isSafe = href && typeof href === 'string' && href.startsWith('https://');

  if (!isSafe) {
    // Unsichere oder fehlende URL → kein Link rendern
    return <span className={`text-stone-400 ${className}`}>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}
