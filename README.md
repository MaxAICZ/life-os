# Life OS

Sistema personal de gestión de vida para Izaak. Árbol jerárquico + dashboard + to-dos + notas + docs + pipeline.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark + teal #06D6A0 + glassmorphism)
- React Flow (árbol interactivo)
- Supabase (Postgres + Storage)
- Render (hosting)
- PWA (mobile)

## Setup local

```bash
npm install
cp .env.example .env.local
# Rellenar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Setup Supabase

1. Crear un proyecto nuevo en https://supabase.com/dashboard
2. Copiar Project URL + anon key → `.env.local`
3. SQL Editor → pegar `supabase/schema.sql` → Run
4. Storage → New bucket → nombre `documents` → Private
5. Storage → documents → Policies → crear policies para `anon` y `authenticated`:
   - SELECT, INSERT, UPDATE, DELETE todos `true` (single-user app)

## Deploy a Render

1. Push este repo a GitHub
2. Render → New Web Service → conectar repo
3. Render detecta `render.yaml` automáticamente
4. Agregar env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## PWA

Al abrir la URL en móvil, Safari/Chrome permite "Add to Home Screen" — se instala como app nativa con ícono.
