# ____ Ventures

A black-and-gold venture network website connecting founders from Harvard, MIT, and beyond with aligned investors. An editorial brochure with short editable placeholder copy, sculptural gold artwork, and the complete Boov component collection available in the repository.

## Run locally

Requires Node.js 22.12+ (or a newer supported release).

```sh
npm ci
npm run dev
```

The development server opens at `http://127.0.0.1:5173`. `npm run build` type-checks the project and produces the static website in `dist`. `npm run preview` serves that production build.

## Design and implementation

- React 19, TypeScript, Vite, Tailwind CSS 4, Motion, GSAP, Lenis, and Lucide.
- Original metallic ribbon rendered with a small WebGL shader and an SVG fallback. It pauses offscreen, on hidden tabs, and when motion is disabled.
- Bronze invitation with scroll-driven rotation, pointer lighting, physical edges, and an engraved rosette.
- Scroll-revealed editorial typography, desktop momentum scrolling, a subtle cursor halo, and reading progress.
- Three additional network chapters: interactive academic origins, kinetic frontier typography, and a guided introduction.
- Local Manrope and Cormorant Garamond fonts.
- Responsive navigation, keyboard-operated network tabs, native accessible dialogs, and global motion controls.
- Optional canvas scenes load near the viewport and have a static fallback.
- All media is local, including the small gold video texture.

Main copy and layout are in `src/App.tsx`. Base tokens and shared controls are in `src/index.css`; the brochure composition and responsive overrides are in `src/editorial.css`. New artwork and interactive chapters use scoped CSS modules. The design system is documented in `design-system/MASTER.md`.

## Magic UI

All 16 distinct components requested are installed and used. Text Animate was listed twice in the request and is installed once.

| Component                | Placement                                                       |
| ------------------------ | --------------------------------------------------------------- |
| Marquee                  | Scrolling focus areas                                           |
| Globe                    | Network → Our reach                                             |
| Orbiting Circles         | Network → Our circles                                           |
| Avatar Circles           | Founder / builder / investor initials in the closing invitation |
| Icon Cloud               | Network → Our frontiers                                         |
| Lens                     | Founder sculpture hover detail                                  |
| Border Beam              | Founder card                                                    |
| Meteors                  | Closing invitation                                              |
| Particles                | Hero atmosphere                                                 |
| Text Animate             | Hero description                                                |
| Aurora Text              | Gold hero headline                                              |
| Video Text               | Oversized footer wordmark                                       |
| Number Ticker            | Three numbered approach steps                                   |
| Hexagon Pattern          | Investor artwork                                                |
| Floating 3D Particles    | Investor artwork                                                |
| Interactive Hover Button | Closing invitation button                                       |

Source lives in `src/components/ui`. Small adaptations improve accessibility, global pause behavior, globe dragging, local utility imports, and video text that supports locally hosted fonts. Do not overwrite these customizations without review.

## Boov component collection

The source repository is [boovwallet/BoovSite](https://github.com/boovwallet/BoovSite). All 29 branches were inspected, including 85 reachable commits. The collection includes 84 component/CSS files from main and 155 distinct historical versions (239 total).

- `references/boov/components`: complete main component source, preserved for reference outside the production bundle.
- `references/boov/variants`: additional distinct source versions from other branches.
- `references/boov/manifest.json`: exact commit/blob provenance and branch membership.
- `src/components/boov/primitives`: 19 reusable React/Vite-compatible primitives, with gold colors and motion/accessibility adaptations.
- `src/components/boov/NetworkAtelier.tsx` and `InvitationStage.tsx`: venture-specific interactive chapters.
- `docs/BOOV_COMPONENTS.md`: precise map of components currently rendered and those available for future sections.

Boov's source collection remains available in full while the brochure uses a considered set of those interactions. Its payment, wallet, and account flows are not part of this venture site.

## MCP servers

`.mcp.json` provides project configuration for the official Magic UI MCP server and shadcn MCP server. Both are installed locally as development dependencies. The verification script connects through the MCP SDK and can call their tools without relying on an editor restart:

```sh
npm run mcp:verify
node scripts/verify-mcp.mjs getRegistryItem '{"name":"globe","includeExamples":true}'
node scripts/verify-mcp.mjs --shadcn get_project_registries
```

Both servers were connected and queried during implementation. The shadcn server detects `@magicui` from `components.json`. Editors that support `.mcp.json` can load this configuration; other clients may need these entries copied into their own MCP configuration. No global editor settings are changed.

References: [Magic UI MCP](https://magicui.design/docs/mcp), [shadcn MCP](https://ui.shadcn.com/docs/mcp).

## Introduction preview

Founder and investor buttons open a working form with validation. Saving stores a single draft under `ventures-introduction` in local storage. Reopening restores the draft; the Privacy dialog can delete it. Details stay on the device. There is no email delivery, CRM, backend, or application submission service yet.

Before a public launch, add the final brand name and copy, connect an approved submission destination, and update the privacy text to match that integration. There are no invented fund sizes, investment results, partner logos, or testimonials. Harvard and MIT are sourcing context, and the footer identifies this as an independent network.

## Verification

- Production TypeScript and Vite build.
- Desktop, tablet, and phone layout checks in the browser.
- Network tabs with mouse and keyboard, founder/investor entry points, required-field validation, save/restore/delete draft flow, and Escape dismissal.
- Motion pause stops ambient canvases and CSS motion; system reduced-motion is also respected.
- Runtime browser console checked after the final changes.

Third-party notices are in `THIRD_PARTY_NOTICES.md`.
