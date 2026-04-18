'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SPINNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f0f13"/><text x="16" y="23" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="20" fill="#34d399">F</text><circle cx="16" cy="16" r="13" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-dasharray="20 60" opacity="0.85"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.9s" repeatCount="indefinite"/></circle></svg>`;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function swapFavicon(href) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const finishRef = useRef(null);
  const fadeRef = useRef(null);
  const originalIcon = useRef(null);
  const isFirstRender = useRef(true);

  // Cache the original favicon href once on mount.
  useEffect(() => {
    if (originalIcon.current) return;
    const link = document.querySelector('link[rel="icon"]');
    originalIcon.current = link?.href || '/icon.svg';
  }, []);

  useEffect(() => {
    // Skip the very first render — no real navigation happened.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setVisible(true);
    setProgress(8);

    // Swap favicon to animated spinner.
    const blob = new Blob([SPINNER_SVG], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    swapFavicon(blobUrl);

    // Animate 8 → 85 over ~600ms via rAF (cubic ease-out).
    const start = performance.now();
    const duration = 600;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(8 + (85 - 8) * easeOut(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    // Snap to 100, then fade out.
    finishRef.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setProgress(100);
      fadeRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
        swapFavicon(originalIcon.current || '/icon.svg');
        URL.revokeObjectURL(blobUrl);
      }, 220);
    }, 700);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (finishRef.current) clearTimeout(finishRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      URL.revokeObjectURL(blobUrl);
      swapFavicon(originalIcon.current || '/icon.svg');
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  const isFading = progress >= 100;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        width: `${progress}%`,
        background: 'var(--accent)',
        boxShadow: '0 0 8px var(--accent), 0 0 14px color-mix(in oklch, var(--accent) 60%, transparent)',
        zIndex: 10000,
        transition: isFading
          ? 'width 200ms ease-out, opacity 220ms ease-out'
          : 'width 80ms linear',
        opacity: isFading ? 0 : 1,
        pointerEvents: 'none',
      }}
    />
  );
}
