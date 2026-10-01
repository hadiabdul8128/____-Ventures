# Boov component integration

## Source access and coverage

The full public repository was cloned, including all **29 branches** and the **85 commits** reachable at inspection. `main` was used as the consolidated baseline; the default branch was an earlier feature branch. The source snapshot is recorded at `references/boov/`.

Every component file at each branch tip was inspected by Git path and blob. All **239 unique component/CSS file versions** are preserved locally, including all **84 component/CSS files on main**. Identical versions shared by several branches are stored once. Historical commits remain accessible in the source repository; this snapshot records branch-tip versions rather than every revision of every file in all history.

The rendered venture site uses adapted components that fit a luxury brochure. Legacy Boov business content, payment controls, academic template sections, and duplicate experiments remain in the source archive for reference. They are not rendered as unrelated product screens on the venture site.

## Runtime library

`src/components/boov/primitives/index.ts` exports the complete reusable UI primitive set from main. It requires only dependencies already present in the venture app: React, Motion, radix-ui, Lucide, clsx, and the shared `cn` utility. No Next.js imports or Boov-specific content modules remain in these ports.

Motion components accept an explicit pause/active flag where they animate autonomously. Canvas scenes suspend offscreen and honor reduced motion; the live atelier additionally gates every scene on its viewport visibility and the site's motion preference. Button palettes use champagne, brass, and warm white. Source originals remain untouched in the reference archive.

| Source component                     | Venture port / use                                            |
| ------------------------------------ | ------------------------------------------------------------- |
| `Pill.tsx`                           | Pill — available library export                               |
| `PullQuote.tsx`                      | PullQuote — available library export                          |
| `SensorCard.tsx`                     | SensorCard — available library export                         |
| `StatCard.tsx`                       | StatCard — available library export                           |
| `animated-circular-progress-bar.tsx` | AnimatedCircularProgressBar — introduction step indicator     |
| `animated-list.tsx`                  | AnimatedList / AnimatedListItem — introduction detail         |
| `animated-theme-toggler.tsx`         | AnimatedThemeToggler — library export                         |
| `flow-field-background.tsx`          | FlowFieldBackground — gold network field                      |
| `gooey-button.tsx`                   | GooeyButton — library export                                  |
| `interactive-grid.tsx`               | InteractiveGrid — conviction typography                       |
| `interactive-hover-button.tsx`       | InteractiveHoverButton — shared existing Magic UI adaptation  |
| `kinetic-grid.tsx`                   | KineticGrid — conviction field                                |
| `morphing-text.tsx`                  | MorphingText — library export                                 |
| `rainbow-button.tsx`                 | RainbowButton — champagne/brass spectral edge, library export |
| `shimmer-button.tsx`                 | ShimmerButton — introduction next step                        |
| `sky-toggle.tsx`                     | SkyToggle — library export                                    |
| `tabs.tsx`                           | Tabs family — library export                                  |
| `vapour-scroll-text.tsx`             | VapourScrollText — library export                             |
| `transition-panel.tsx`               | TransitionPanel — introduction copy handoff                   |

## NetworkAtelier

Export: `NetworkAtelier` (named and default). Props: `{ enabled: boolean }`.

- **Origins:** selectable Harvard, MIT, and “& beyond” nodes; a gold flow field and fine orbital diagram. Institution names describe sourcing origins and do not imply a formal affiliation.
- **Conviction:** three areas of possibility; kinetic canvas lines and a pointer-reactive dot reveal inside large editorial text. Mobile and reduced-motion layouts keep the text readable without hover.
- **Connection:** an interactive three-step introduction sequence with a circular indicator, an animated detail, a transition panel, and shimmer navigation.

Tabs support Left/Right arrows, Home, End, and roving focus. All controls are keyboard accessible and at least 44px tall. Reduced-motion and global pause settings suppress autonomous movement. Canvas effects release observers, listeners, and animation frames on unmount.

## Full main component inventory

These files are preserved unchanged under `references/boov/components/`. Entries under `ui/` and `motion-primitives/` have runtime ports as described above. Other sections provide source material for the brochure redesign or remain reference-only. This inventory deliberately distinguishes source availability from rendered use.

- `components/Abstract.tsx`
- `components/Achievements.tsx`
- `components/AlertsFeed.module.css`
- `components/AlertsFeed.tsx`
- `components/AnimatedText.module.css`
- `components/AnimatedText.tsx`
- `components/AppShell.tsx`
- `components/BoovCompanion.module.css`
- `components/BoovCompanion.tsx`
- `components/BoovExperience.module.css`
- `components/BoovExperience.tsx`
- `components/CtaWaitlist.module.css`
- `components/CtaWaitlist.tsx`
- `components/Cursor.module.css`
- `components/Cursor.tsx`
- `components/DisplacementFilter.tsx`
- `components/FluidBackground.tsx`
- `components/Footer.tsx`
- `components/Hero.tsx`
- `components/HorizontalChapterTransition.module.css`
- `components/HorizontalChapterTransition.tsx`
- `components/ImpactStats.module.css`
- `components/ImpactStats.tsx`
- `components/Manifesto.module.css`
- `components/Manifesto.tsx`
- `components/Marquee.module.css`
- `components/Marquee.tsx`
- `components/MotionEnhancer.tsx`
- `components/Nav.tsx`
- `components/OrbitField.tsx`
- `components/PopularArticle.tsx`
- `components/Preloader.module.css`
- `components/Preloader.tsx`
- `components/Presentation.tsx`
- `components/PulseWaveform.tsx`
- `components/Reflection.tsx`
- `components/ResearchOverview.tsx`
- `components/Resume.tsx`
- `components/ScrollReset.tsx`
- `components/Section.tsx`
- `components/SiteFooter.module.css`
- `components/SiteFooter.tsx`
- `components/SiteNav.module.css`
- `components/SiteNav.tsx`
- `components/SpendingControls.module.css`
- `components/SpendingControls.tsx`
- `components/TechnicalOverlay.module.css`
- `components/TechnicalOverlay.tsx`
- `components/boov/BoovCharacter.module.css`
- `components/boov/BoovCharacter.tsx`
- `components/boov/BoovReserve.module.css`
- `components/boov/BoovReserve.tsx`
- `components/lab/GsapExhibit.module.css`
- `components/lab/GsapExhibit.tsx`
- `components/lab/LabSection.module.css`
- `components/lab/LabSection.tsx`
- `components/lab/MagicExhibit.module.css`
- `components/lab/MagicExhibit.tsx`
- `components/lab/MotionExhibit.module.css`
- `components/lab/MotionExhibit.tsx`
- `components/lab/SpringExhibit.module.css`
- `components/lab/SpringExhibit.tsx`
- `components/motion-primitives/transition-panel.tsx`
- `components/ui/Pill.tsx`
- `components/ui/PullQuote.tsx`
- `components/ui/SensorCard.tsx`
- `components/ui/StatCard.tsx`
- `components/ui/animated-circular-progress-bar.tsx`
- `components/ui/animated-list.tsx`
- `components/ui/animated-theme-toggler.tsx`
- `components/ui/flow-field-background.tsx`
- `components/ui/gooey-button.module.css`
- `components/ui/gooey-button.tsx`
- `components/ui/interactive-grid.tsx`
- `components/ui/interactive-hover-button.tsx`
- `components/ui/kinetic-grid.tsx`
- `components/ui/morphing-text.tsx`
- `components/ui/rainbow-button.tsx`
- `components/ui/shimmer-button.tsx`
- `components/ui/sky-toggle.module.css`
- `components/ui/sky-toggle.tsx`
- `components/ui/tabs.tsx`
- `components/ui/vapour-scroll-text.module.css`
- `components/ui/vapour-scroll-text.tsx`
