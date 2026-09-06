# HCBB Pathway

Website for the HCBB Pathway League — built with [Next.js](https://nextjs.org).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. Edit `src/app/page.tsx` and the site auto-updates.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (theme tokens in `src/app/globals.css`)
- Fonts: Archivo / Archivo Black via `next/font/google`

Sample data for the homepage (teams, standings, scores, pipeline, stat leaders) lives in `src/lib/data.ts` — swap it for real data as the league's data source comes online.
