'use client';

import { useState } from 'react';

export default function PasswordForm({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login fehlgeschlagen');
        return;
      }
      onSuccess?.(data.csrf);
    } catch (err) {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        maxWidth: 400,
        margin: '60px auto',
        padding: 32,
        background: 'var(--bg2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
        Admin-Bereich
      </h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
        Bitte Passwort eingeben.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Passwort"
        autoFocus
        autoComplete="current-password"
        style={{
          padding: '12px 14px',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          color: 'var(--text)',
          fontSize: 15,
          outline: 'none',
        }}
      />
      {error && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'color-mix(in oklch, oklch(0.7 0.2 25) 12%, transparent)',
            border: '1px solid color-mix(in oklch, oklch(0.7 0.2 25) 30%, transparent)',
            color: 'oklch(0.85 0.18 25)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !password}
        className="btn-accent"
        style={{
          padding: '12px 16px',
          borderRadius: 10,
          border: 'none',
          background: 'var(--accent)',
          color: 'var(--bg)',
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading || !password ? 0.6 : 1,
          fontSize: 14,
        }}
      >
        {loading ? 'Prüfe…' : 'Anmelden'}
      </button>
    </form>
  );
}
