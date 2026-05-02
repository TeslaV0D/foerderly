'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PasswordForm from '../components/PasswordForm';
import BlogForm from '../components/BlogForm';

export default function AddPage() {
  const [csrf, setCsrf] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated && data.csrf) setCsrf(data.csrf);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCsrf(null);
  }

  return (
    <main className="min-h-screen relative z-10">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-12">
        {checking ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Lade…</div>
        ) : !csrf ? (
          <PasswordForm onSuccess={(token) => setCsrf(token)} />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)' }}>
                Neuer Beitrag
              </h1>
              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Abmelden
              </button>
            </div>
            <BlogForm csrfToken={csrf} />
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
