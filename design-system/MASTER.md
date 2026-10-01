# Boston Square Ventures — design system

## Direction

Pareto Fellowship × Zerobase. From Pareto: a centered hero with a heavy headline and a lighter slanted turn, a facts strip, an oversized light-weight perks list, FAQ, and a blunt closing line. From Zerobase: pure black, lowercase conversational copy, "weekly lectures and homework", "costs? nothing.", and "founders, are you ready to build?" as the application heading.

One track — the founder track. No tiers, no junior varsity.

## The mark

A square with **B** top-left and **V** bottom-right, white on black. The square is the brand motif: it recurs as the interactive hero lattice, the marquee separators, and the square corners everywhere. Full kit and usage rules in `brand/README.md`.

## Tokens

| Role           | Value                                       |
| -------------- | ------------------------------------------- |
| Background     | `#000000`                                   |
| Raised surface | `#0a0a0a`                                   |
| Main text      | `#f4f4f2`                                   |
| Secondary text | `#8b8b86`                                   |
| Dim text       | `#5a5a56`                                   |
| Hairline       | `#1c1c1c` (strong: `#2a2a2a`)               |
| Type           | Google Sans Flex Variable; Figtree fallback |
| Headline       | weight 500, tracking −0.03 to −0.04 em      |
| Accent         | weight 300, oblique 10° (slant axis)        |
| Body           | weight 300–400                              |
| Gutter         | `clamp(24px, 6vw, 96px)`                    |
| Max width      | 1180px                                      |

No accent color. Hierarchy comes from size, weight, slant, and white vs. gray. Corners are square everywhere except headshots. Buttons are 1px outlines or solid white.

## Voice

Lowercase sentences, short, a little irreverent, never cute. Section headings are questions or flat statements ("what's included?", "costs? nothing."). Claims stay honest: no invented stats, fund sizes, partners, or testimonials. The facts strip only shows program parameters (4 weeks, 30 min, 1 homework, $0). Tagline: "start at square one."

## Structure

1. Hero over the interactive square field: eyebrow, headline + slanted turn, lede, solid CTA + text link, a hint to move the cursor.
2. Receipts: marquee of real logos — institutions and companies the founders have actually been through.
3. The track: copy left (sticky), a card with the mark and eight bullet points right.
4. Facts: four number tickers on hairlines.
5. Perks: oversized list, title left and body right.
6. Program: sticky copy left, four weeks right (lecture + homework).
7. Founders: two cards — headshot, chip, name, school with crest, bio, socials, credential pills with real logos.
8. Cost, FAQ (native `details`), Apply (native form, local save), Closing, Footer.

## Motion and accessibility

The hero canvas: a 30px lattice of 1.6px squares that brighten and lean away within 190px of the pointer, ripple outward on click/tap, and breathe on a slow sine wave when idle. It is `aria-hidden`, capped at 2× DPR, and replaced by a static CSS dot grid under `prefers-reduced-motion`. Reveal-on-scroll is a 0.7s fade/rise, once. Native buttons, labeled inputs, visible focus rings, skip link, `details`/`summary` for FAQ. Check at 390, 820, 1000, and 1440 pixels.
