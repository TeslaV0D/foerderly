# Blog-System Deployment

## 1. Supabase

Migration & Storage-Bucket sind bereits ausgeführt (Project `wvuqovpizgbaqjbutkqk`).
Falls du sie auf einem anderen Projekt erneut anwenden willst, führe `supabase/migrations/004_blog_posts.sql` aus.

## 2. Vercel Environment Variables

In Vercel → Project `foerderfinder` → Settings → Environment Variables folgende Werte hinzufügen
(Production + Preview):

| Variable                        | Wert                                                                  |
| ------------------------------- | --------------------------------------------------------------------- |
| `ADMIN_PASSWORD`                | `Teslav0d357753.`                                                     |
| `ADMIN_SESSION_SECRET`          | beliebiger zufälliger 64-Zeichen-String (z.B. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://wvuqovpizgbaqjbutkqk.supabase.co`                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (vorhandener anon key)                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | (service-role key, **server-only**, NICHT public)                     |

`SUPABASE_SERVICE_ROLE_KEY` darf NIE im Client landen — wird nur in API-Routes mit
`runtime = 'nodejs'` benutzt.

## 3. Lokales Testen

```bash
# .env.local
ADMIN_PASSWORD=Teslav0d357753.
ADMIN_SESSION_SECRET=<random>
NEXT_PUBLIC_SUPABASE_URL=https://wvuqovpizgbaqjbutkqk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

npm run dev
```

Test-Flow:

1. `http://localhost:3000/add` → Passwort eingeben
2. Beitrag mit Bild erstellen → "Veröffentlichen"
3. Redirect zu `/blog/<slug>` — Inhalt geprüft
4. `/blog` → Liste enthält den Beitrag
5. `/` → "Aktuelle Beiträge" zeigt 3 Posts

## 4. Deploy

```bash
git push origin main
```

Vercel deployt automatisch.

## Endpunkte

| Methode | Route                         | Auth        |
| ------- | ----------------------------- | ----------- |
| POST    | `/api/auth/verify-password`   | öffentlich  |
| GET     | `/api/auth/session`           | öffentlich  |
| POST    | `/api/auth/logout`            | öffentlich  |
| POST    | `/api/blog/create`            | Admin+CSRF  |
| POST    | `/api/blog/upload`            | Admin+CSRF  |
| GET     | `/api/blog/list?page=1`       | öffentlich  |
| GET     | `/api/blog/latest?limit=3`    | öffentlich  |
| GET     | `/api/blog/[slug]`            | öffentlich  |
| GET     | `/api/blog/similar?slug=…`    | öffentlich  |

## Sicherheit

- Session-Cookie: HttpOnly + Secure + SameSite=Strict + 24h Expiry, HMAC-signed
- CSRF: Token aus Session, per `X-CSRF-Token`-Header bei jedem mutierenden Request
- Rate-Limit: Login 5/min, Create 10/h
- Content: DOMPurify-sanitized Markdown → HTML, keine `<script>` / inline-Handler
- Storage: Service-Role schreibt, alle anderen nur lesen
- RLS: Public Read nur für `status = 'published'`
