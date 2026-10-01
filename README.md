# ____ Ventures

A black-and-gold venture network website connecting founders from Harvard, MIT, and beyond with aligned investors. This is the first visual foundation, with short editable placeholder copy.

## Run locally

Requires Node.js 22.12+ (or a newer supported release).

```sh
npm ci
npm run dev
```

The development server opens at `http://127.0.0.1:5173`. `npm run build` type-checks the project and produces the static website in `dist`. `npm run preview` serves that production build.

## Design and implementation

- React, TypeScript, Vite, Tailwind CSS 4, Motion, and Lucide.
- Original gold sculpture rendered as parametric SVG; no stock imagery.
- Local Manrope and Cormorant Garamond fonts.
- Responsive navigation, keyboard-operated network tabs, native accessible dialogs, and global motion controls.
- Optional canvas scenes load near the viewport and have a static fallback.
- All media is local, including the small gold video texture.

Main copy and layout are in `src/App.tsx`. Visual tokens and responsive rules are in `src/index.css`. The design system is documented in `design-system/MASTER.md`.

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
