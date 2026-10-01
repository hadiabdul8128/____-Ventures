# ____ Ventures — design system

## Direction

An independent venture network with the restraint of a luxury editorial website. Lead with one sculptural visual, three lines of type, and one primary invitation. Keep the page spacious and the copy brief.

The UI/UX Pro Max design-system search recommended exaggerated minimalism, oversized editorial typography, generous space, and restrained motion. The user's explicit black-and-gold palette overrides the search's default light/pink palette.

## Tokens

| Role           | Value                                |
| -------------- | ------------------------------------ |
| Background     | `#080908`                            |
| Raised surface | `#0d0f0c`                            |
| Main text      | `#eae6dc`                            |
| Secondary text | `#a09f93`                            |
| Champagne gold | `#cfb679`                            |
| Hairline       | `#292a23`                            |
| Editorial type | Cormorant Garamond, regular / italic |
| Interface type | Manrope Variable                     |
| Desktop gutter | 6.1vw                                |
| Phone gutter   | 24px                                 |

Use serif type at large sizes, gold italics sparingly, and small tracked labels as editorial structure. Keep corners square apart from diagrams and circular arrow controls. Avoid decorative dashboard statistics and partner claims.

## Structure

1. Hero: original gold torus, clear premise, founder invitation.
2. Origins: Harvard, MIT, and beyond as sourcing context.
3. Thesis: a short statement of the purpose of the network.
4. Network: reach, circles, and frontiers in a keyboard-accessible tab set.
5. Approach: founder and investor invitations, followed by three steps.
6. Sector interlude and closing invitation.
7. Large typographic signature and minimal footer.

## Motion and accessibility

Ambient motion should feel slow and quiet. Every decorative animation follows the global pause control and the system reduced-motion preference. Do not make any content depend on animation. Use native buttons, visible keyboard focus, labeled forms, and native dialogs. Load heavy canvas scenes near the viewport; preserve a static fallback.

Check layouts at 375, 768, 1024, and 1440 pixels. Preserve natural mobile scrolling and generous touch targets. Keep all meaningful copy selectable; do not turn headings into canvas artwork.

## Art direction references

- [Morabito](https://morabitoparis.com/): editorial pacing and ample space.
- [Lorenzo Galli](https://www.lorenzogalli.com/): black-and-gold restraint.
- [The Macallan](https://www.themacallan.com/): warm dark storytelling.
- [Lusion](https://lusion.co/): one memorable interactive centerpiece.
- [Obys](https://obys.agency/): strong typographic composition.

These are references for composition and mood. The sculpture, diagrams, video texture, and layout are original to this project.

## Second edition — editorial brochure

The active composition is a black-and-gold venture brochure. Use the phrase “The art of what’s next.” as the opening, an original solid gold ribbon as its centerpiece, and oversized serif statements with sparse supporting text. The visual hierarchy comes from scale, materials, and space.

The UI/UX Pro design search was rerun with variance 8, motion 8, and density 2. Its editorial typography and spacious composition guidance apply. Keep the existing dark palette and avoid the generic bento recommendation because this project calls for a bespoke brochure.

- Desktop content gutter: 8vw; header 6vw. Phone gutter: 24px.
- Hero: two lines of large serif typography, one primary CTA, metallic artwork on the right. Mobile places artwork below the main actions.
- Chapters: philosophy → physical invitation → global network → interactive network study → founder/investor perspectives → closing invitation.
- Gold: #d6ba80; text: #eee9df; base: #080908; warm surfaces: #10110e.
- Numbered dividers, fine warm borders, foil finishes, measured depth; keep text selectable and make every button functional.
- Motion: GSAP typography reveals, Lenis on desktop only, Motion springs for invitation lighting/rotation. All effects follow pause and reduced-motion settings. Native touch scrolling and dialogs remain usable.
- Components: keep Boov originals and variants under references, and keep production adapters under src/components/boov. Record which are rendered and which are available in docs/BOOV_COMPONENTS.md.
