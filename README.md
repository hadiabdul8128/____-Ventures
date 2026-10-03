# Boston Square Ventures

A free, online, 4-week founder sprint for student founders from Harvard, MIT, and beyond — plus the network that backs them after. Monochrome, lowercase, one track. The site borrows Pareto Fellowship's structure and Zerobase's casual startup-school voice.

## Run locally

Requires Node.js 22.12+ (or a newer supported release).

```sh
npm ci
npm run dev
```

The development server opens at `http://127.0.0.1:5173`. `npm run build` type-checks the project and produces the static website in `dist`. `npm run preview` serves that production build.

## Where things live

| Path                             | Purpose                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `src/content.ts`                 | Every line of copy, link, logo, founder detail, FAQ, and form label                    |
| `src/App.tsx`                    | Section order                                                                          |
| `src/sections/*.tsx`             | Hero + logo marquee, track/facts/perks/program, founders/cost/FAQ, apply/closing       |
| `src/components/Shell.tsx`       | Header, mobile nav, footer, reveal wrapper, social glyphs                              |
| `src/components/Mark.tsx`        | The BV square mark (outlined paths from `markPaths.ts`)                                |
| `src/components/SquareField.tsx` | Interactive hero background: a lattice that reacts to the pointer and ripples on click |
| `src/index.css`                  | Tokens, typography, layout, responsive rules                                           |
| `public/founders/`               | Founder headshots                                                                      |
| `public/logos/`                  | Institution / company logos used in the marquee and credential pills                   |
| `brand/`                         | Full brand kit (see `brand/README.md`)                                                 |
| `scripts/brand-kit.mjs`          | Generates `brand/` and `src/components/markPaths.ts`                                   |
| `design-system/MASTER.md`        | Design direction and tokens                                                            |

Edit copy in `src/content.ts` first; components only read from it. Anything still unverified is marked `[PLACEHOLDER]` there.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide. Type is **Google Sans Flex** (SIL OFL, self-hosted via Fontsource) with **Figtree** as fallback. Magic UI components live in `src/components/ui`; the site currently uses `Marquee` and `NumberTicker`.

## Brand kit

```sh
npm run brand:build
```

Regenerates every logo, lockup, LinkedIn/social banner, and favicon in `brand/`, plus the outlined letter paths the site's `<Mark/>` uses. Letterforms come from the static Google Sans Flex TTFs in `scripts/fonts/` (downloaded from Google Fonts; OFL) so the output never depends on an installed font. Rasters are rendered with Playwright's Chromium — run `npx playwright install chromium` once if it's missing.

## Application form

The apply section is a native form with required-field validation and an optional resume upload (PDF/Word, 5 MB). Text fields are drafted to local storage under `ventures-application` while typing so nothing is lost on reload; a successful submit clears the draft and shows a confirmation.

## Applications (Supabase)

Submissions go to a Supabase project through `src/lib/applications.ts`: a row in `public.applications` plus the resume in the private `resumes` bucket. The site reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; when they are unset the form shows a "not wired up yet" message instead of sending. Setup (SQL migration, keys, local and Vercel env vars) is in [`supabase/README.md`](supabase/README.md).

## Logos

`public/logos/` contains third-party marks (Harvard, MIT, Y Combinator, Mercor, Forbes, Coca-Cola Scholars Foundation, Duke, Amazon) used to identify the founders' affiliations. They belong to their owners and are shown nominatively; replace or remove any on request.

## MCP servers

`.mcp.json` configures the Magic UI and shadcn MCP servers (installed as dev dependencies). `npm run mcp:verify` connects and lists tools; see `scripts/verify-mcp.mjs`.

## Verification

- `npm run typecheck` and `npm run build` pass.
- Desktop (1440) and phone (390) layouts checked in a headless browser with no console errors.
- Reduced-motion preference swaps the interactive canvas for a static dot grid and disables reveal animations.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
