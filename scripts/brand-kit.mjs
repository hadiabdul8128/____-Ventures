/**
 * Generates the Boston Square Ventures brand kit into /brand and refreshes the
 * outlined logo paths used by the site (src/components/markPaths.ts).
 *
 *   npm run brand:build
 *
 * Letterforms are Google Sans Flex (OFL) converted to outlines, so no file in
 * the kit depends on the font being installed. Rasters are rendered with
 * Playwright's bundled Chromium.
 */
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const fontkit = createRequire(import.meta.url)("fontkit");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (...p) => resolve(root, "brand", ...p);
const FONTS = {
  600: fontkit.openSync(resolve(root, "scripts/fonts/gsf-600.ttf")),
  500: fontkit.openSync(resolve(root, "scripts/fonts/gsf-500.ttf")),
  400: fontkit.openSync(resolve(root, "scripts/fonts/gsf-400.ttf")),
};

const WHITE = "#ffffff";
const BLACK = "#000000";
const GRAY = "#8b8b86";

// ---------------------------------------------------------------- text → path

/** Lay out `text` at `size` px (em) with its ink box anchored by `anchor`. */
function textPath(
  text,
  { weight = 500, size, x = 0, y = 0, anchor = "left", letterSpacing = 0 },
) {
  const font = FONTS[weight];
  const s = size / font.unitsPerEm;
  const run = font.layout(text);
  let pen = 0;
  const parts = [];
  let minX = Infinity;
  let maxX = -Infinity;
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    const gx = pen + pos.xOffset;
    const path = glyph.path.transform(s, 0, 0, -s, gx * s, -pos.yOffset * s);
    if (glyph.bbox.maxX > glyph.bbox.minX) {
      minX = Math.min(minX, (gx + glyph.bbox.minX) * s);
      maxX = Math.max(maxX, (gx + glyph.bbox.maxX) * s);
      parts.push(path.toSVG());
    }
    pen += pos.xAdvance + letterSpacing / s;
  });
  const width = maxX - minX;
  const shift =
    anchor === "right"
      ? x - maxX
      : anchor === "center"
        ? x - minX - width / 2
        : x - minX;
  const d = parts.join(" ");
  return {
    d,
    transform: `translate(${shift.toFixed(3)} ${y.toFixed(3)})`,
    width,
    capHeight: (font.capHeight / font.unitsPerEm) * size,
  };
}

// ---------------------------------------------------------------- the mark

/**
 * A 400×400 square. "B" sits in the top-left corner, "V" in the bottom-right,
 * both set in Google Sans Flex SemiBold.
 */
const MARK = { size: 400, stroke: 22, pad: 66, cap: 112 };

function markParts(color) {
  const { size, stroke, pad, cap } = MARK;
  const fontSize = cap / (FONTS[600].capHeight / FONTS[600].unitsPerEm);
  const b = textPath("B", {
    weight: 600,
    size: fontSize,
    x: pad,
    y: pad + cap,
    anchor: "left",
  });
  const v = textPath("V", {
    weight: 600,
    size: fontSize,
    x: size - pad,
    y: size - pad,
    anchor: "right",
  });
  const half = stroke / 2;
  return {
    rect: `<rect x="${half}" y="${half}" width="${size - stroke}" height="${size - stroke}" fill="none" stroke="${color}" stroke-width="${stroke}"/>`,
    b: `<path transform="${b.transform}" d="${b.d}" fill="${color}"/>`,
    v: `<path transform="${v.transform}" d="${v.d}" fill="${color}"/>`,
    paths: { b, v },
  };
}

function markSvg({ fg, bg, padding = 0 }) {
  const { size } = MARK;
  const total = size + padding * 2;
  const m = markParts(fg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">
${bg ? `<rect width="${total}" height="${total}" fill="${bg}"/>` : ""}
<g transform="translate(${padding} ${padding})">${m.rect}${m.b}${m.v}</g>
</svg>`;
}

// ---------------------------------------------------------------- lockups

function lockupHorizontalSvg({ fg, bg }) {
  const markH = 120;
  const gap = 44;
  const scale = markH / MARK.size;
  const text = textPath("Boston Square Ventures", {
    weight: 500,
    size: 76,
    x: markH + gap,
    y: markH / 2 + 27,
    anchor: "left",
    letterSpacing: -1.5,
  });
  const w = Math.ceil(markH + gap + text.width);
  const h = markH;
  const padX = 40;
  const padY = 40;
  const m = markParts(fg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w + padX * 2} ${h + padY * 2}" width="${w + padX * 2}" height="${h + padY * 2}">
${bg ? `<rect width="${w + padX * 2}" height="${h + padY * 2}" fill="${bg}"/>` : ""}
<g transform="translate(${padX} ${padY})">
<g transform="scale(${scale})">${m.rect}${m.b}${m.v}</g>
<path transform="${text.transform}" d="${text.d}" fill="${fg}"/>
</g>
</svg>`;
}

function lockupStackedSvg({ fg, bg }) {
  const markH = 220;
  const scale = markH / MARK.size;
  const w = 760;
  const pad = 60;
  const text = textPath("Boston Square Ventures", {
    weight: 500,
    size: 60,
    x: w / 2,
    y: markH + 110,
    anchor: "center",
    letterSpacing: -1,
  });
  const tag = textPath("start at square one.", {
    weight: 400,
    size: 30,
    x: w / 2,
    y: markH + 166,
    anchor: "center",
  });
  const h = markH + 200;
  const m = markParts(fg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h + pad * 2}" width="${w}" height="${h + pad * 2}">
${bg ? `<rect width="${w}" height="${h + pad * 2}" fill="${bg}"/>` : ""}
<g transform="translate(0 ${pad})">
<g transform="translate(${(w - markH) / 2} 0) scale(${scale})">${m.rect}${m.b}${m.v}</g>
<path transform="${text.transform}" d="${text.d}" fill="${fg}"/>
<path transform="${tag.transform}" d="${tag.d}" fill="${GRAY}"/>
</g>
</svg>`;
}

// ---------------------------------------------------------------- banners

function gridPattern(id, step, dot, color, opacity) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><rect x="${step / 2 - dot / 2}" y="${step / 2 - dot / 2}" width="${dot}" height="${dot}" fill="${color}" opacity="${opacity}"/></pattern>`;
}

/**
 * Generic dark banner: mark on the left, wordmark + line(s) of copy beside it.
 * align "right" sets the copy flush right with no mark (e.g. the LinkedIn
 * company cover, where the page logo already sits over the left side).
 */
function bannerSvg({ w, h, markH, title, lines, align = "left", safe = 0 }) {
  const m = markParts(WHITE);
  const scale = markH / MARK.size;
  const gridStep = Math.round(h / 9);
  const cx = align === "center" ? w / 2 : null;
  const titleSize = Math.round(markH * 0.46);
  const bodySize = Math.round(markH * 0.2);
  let body = "";
  if (align === "center") {
    const markY =
      (h - markH - (titleSize * 1.15 + lines.length * bodySize * 1.7)) / 2;
    const t = textPath(title, {
      weight: 500,
      size: titleSize,
      x: cx,
      y: markY + markH + titleSize * 1.15,
      anchor: "center",
      letterSpacing: -titleSize * 0.02,
    });
    body += `<g transform="translate(${(w - markH) / 2} ${markY}) scale(${scale})">${m.rect}${m.b}${m.v}</g>`;
    body += `<path transform="${t.transform}" d="${t.d}" fill="${WHITE}"/>`;
    lines.forEach((line, i) => {
      const p = textPath(line, {
        weight: 400,
        size: bodySize,
        x: cx,
        y: markY + markH + titleSize * 1.15 + bodySize * 1.7 * (i + 1),
        anchor: "center",
      });
      body += `<path transform="${p.transform}" d="${p.d}" fill="${GRAY}"/>`;
    });
  } else if (align === "right") {
    const right = w - safe - Math.round(h * 0.16);
    const blockH = titleSize + lines.length * bodySize * 1.7;
    const baseY = (h - blockH) / 2 + titleSize * 0.92;
    const t = textPath(title, {
      weight: 500,
      size: titleSize,
      x: right,
      y: baseY,
      anchor: "right",
      letterSpacing: -titleSize * 0.02,
    });
    body += `<path transform="${t.transform}" d="${t.d}" fill="${WHITE}"/>`;
    lines.forEach((line, i) => {
      const p = textPath(line, {
        weight: 400,
        size: bodySize,
        x: right,
        y: baseY + bodySize * 1.7 * (i + 1),
        anchor: "right",
      });
      body += `<path transform="${p.transform}" d="${p.d}" fill="${GRAY}"/>`;
    });
  } else {
    const left = safe + Math.round(h * 0.16);
    const markY = (h - markH) / 2;
    const textX = left + markH + Math.round(markH * 0.34);
    const blockH = titleSize + lines.length * bodySize * 1.7;
    const baseY = (h - blockH) / 2 + titleSize * 0.92;
    const t = textPath(title, {
      weight: 500,
      size: titleSize,
      x: textX,
      y: baseY,
      anchor: "left",
      letterSpacing: -titleSize * 0.02,
    });
    body += `<g transform="translate(${left} ${markY}) scale(${scale})">${m.rect}${m.b}${m.v}</g>`;
    body += `<path transform="${t.transform}" d="${t.d}" fill="${WHITE}"/>`;
    lines.forEach((line, i) => {
      const p = textPath(line, {
        weight: 400,
        size: bodySize,
        x: textX,
        y: baseY + bodySize * 1.7 * (i + 1),
        anchor: "left",
      });
      body += `<path transform="${p.transform}" d="${p.d}" fill="${GRAY}"/>`;
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>${gridPattern("g", gridStep, 2, WHITE, 0.16)}
<radialGradient id="fade" cx="${align === "center" ? "50%" : align === "right" ? "72%" : "28%"}" cy="50%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask></defs>
<rect width="${w}" height="${h}" fill="${BLACK}"/>
<rect width="${w}" height="${h}" fill="url(#g)" mask="url(#m)"/>
${body}
</svg>`;
}

// ---------------------------------------------------------------- render

async function main() {
  for (const dir of ["logo", "linkedin", "social", "favicon"])
    mkdirSync(out(dir), { recursive: true });

  const files = [];
  const add = (dir, name, svg, rasters) =>
    files.push({ dir, name, svg, rasters });

  // Marks
  add(
    "logo",
    "bsv-mark-white-on-black",
    markSvg({ fg: WHITE, bg: BLACK, padding: 60 }),
    [
      { size: 2048, png: true, jpg: true },
      { size: 1024, png: true },
      { size: 512, png: true },
    ],
  );
  add(
    "logo",
    "bsv-mark-black-on-white",
    markSvg({ fg: BLACK, bg: WHITE, padding: 60 }),
    [
      { size: 2048, png: true, jpg: true },
      { size: 1024, png: true },
    ],
  );
  add("logo", "bsv-mark-white-transparent", markSvg({ fg: WHITE }), [
    { size: 2048, png: true, transparent: true },
    { size: 1024, png: true, transparent: true },
    { size: 512, png: true, transparent: true },
    { size: 256, png: true, transparent: true },
  ]);
  add("logo", "bsv-mark-black-transparent", markSvg({ fg: BLACK }), [
    { size: 2048, png: true, transparent: true },
    { size: 1024, png: true, transparent: true },
    { size: 512, png: true, transparent: true },
  ]);

  // Lockups
  add(
    "logo",
    "bsv-lockup-horizontal-white-on-black",
    lockupHorizontalSvg({ fg: WHITE, bg: BLACK }),
    [{ width: 1500, png: true, jpg: true, scale: 2 }],
  );
  add(
    "logo",
    "bsv-lockup-horizontal-white-transparent",
    lockupHorizontalSvg({ fg: WHITE }),
    [{ width: 1500, png: true, scale: 2 }],
  );
  add(
    "logo",
    "bsv-lockup-horizontal-black-transparent",
    lockupHorizontalSvg({ fg: BLACK }),
    [{ width: 1500, png: true, scale: 2 }],
  );
  add(
    "logo",
    "bsv-lockup-horizontal-black-on-white",
    lockupHorizontalSvg({ fg: BLACK, bg: WHITE }),
    [{ width: 1500, png: true, jpg: true, scale: 2 }],
  );
  add(
    "logo",
    "bsv-lockup-stacked-white-on-black",
    lockupStackedSvg({ fg: WHITE, bg: BLACK }),
    [{ width: 1140, png: true, jpg: true, scale: 2 }],
  );
  add(
    "logo",
    "bsv-lockup-stacked-white-transparent",
    lockupStackedSvg({ fg: WHITE }),
    [{ width: 1140, png: true, scale: 2 }],
  );

  // LinkedIn
  add(
    "linkedin",
    "linkedin-company-logo-400x400",
    markSvg({ fg: WHITE, bg: BLACK, padding: 70 }),
    [{ size: 400, png: true }],
  );
  add(
    "linkedin",
    "linkedin-company-cover-1128x191",
    bannerSvg({
      w: 1128,
      h: 191,
      markH: 96,
      title: "Boston Square Ventures",
      lines: ["incubator until you raise."],
      align: "right",
      // LinkedIn's cover cropper trims ~4% off each side; keep copy clear of it.
      safe: 64,
    }),
    [{ width: 1128, png: true, scale: 2 }],
  );
  add(
    "linkedin",
    "linkedin-personal-banner-1584x396",
    bannerSvg({
      w: 1584,
      h: 396,
      markH: 180,
      title: "Boston Square Ventures",
      lines: [
        "start at square one.",
        "founder sprint · cohort 01 · online · free",
      ],
      safe: 0,
    }),
    [{ width: 1584, png: true, scale: 2 }],
  );
  add(
    "linkedin",
    "linkedin-post-1200x627",
    bannerSvg({
      w: 1200,
      h: 627,
      markH: 180,
      title: "Boston Square Ventures",
      lines: [
        "4 weeks. one track. for founders who'd build anyway.",
        "applications open for cohort 01.",
      ],
      align: "center",
    }),
    [{ width: 1200, png: true, scale: 2 }],
  );
  add(
    "linkedin",
    "linkedin-event-1600x900",
    bannerSvg({
      w: 1600,
      h: 900,
      markH: 240,
      title: "Boston Square Ventures",
      lines: [
        "a free, online, 4-week founder sprint",
        "for student founders from Harvard, MIT, and beyond.",
      ],
      align: "center",
    }),
    [{ width: 1600, png: true }],
  );

  // Other social
  add(
    "social",
    "og-image-1200x630",
    bannerSvg({
      w: 1200,
      h: 630,
      markH: 180,
      title: "Boston Square Ventures",
      lines: ["4 weeks. one track. for founders who'd build anyway."],
      align: "center",
    }),
    [{ width: 1200, png: true, scale: 2 }],
  );
  add(
    "social",
    "x-header-1500x500",
    bannerSvg({
      w: 1500,
      h: 500,
      markH: 200,
      title: "Boston Square Ventures",
      lines: ["start at square one."],
      safe: 0,
    }),
    [{ width: 1500, png: true, scale: 2 }],
  );
  add(
    "social",
    "instagram-profile-1080x1080",
    markSvg({ fg: WHITE, bg: BLACK, padding: 110 }),
    [{ size: 1080, png: true, jpg: true }],
  );
  add(
    "social",
    "instagram-post-1080x1080",
    bannerSvg({
      w: 1080,
      h: 1080,
      markH: 260,
      title: "Boston Square Ventures",
      lines: ["4 weeks. one track.", "for founders who'd build anyway."],
      align: "center",
    }),
    [{ width: 1080, png: true, jpg: true }],
  );

  // Favicons
  add("favicon", "favicon", markSvg({ fg: WHITE, bg: BLACK, padding: 40 }), [
    { size: 512, png: true, name: "favicon-512" },
    { size: 192, png: true, name: "favicon-192" },
    { size: 180, png: true, name: "apple-touch-icon-180" },
    { size: 32, png: true, name: "favicon-32" },
  ]);

  for (const f of files) writeFileSync(out(f.dir, `${f.name}.svg`), f.svg);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (f, r, scale) => {
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(f.svg);
    const [vw, vh] = [Number(vb[1]), Number(vb[2])];
    const baseWidth = r.size ?? r.width;
    const baseHeight = r.size ?? Math.round((baseWidth * vh) / vw);
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent">
      <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(f.svg)}" style="display:block;width:${width}px;height:${height}px"/></body></html>`,
    );
    const stem = r.name ?? (r.size ? `${f.name}-${r.size}` : f.name);
    const base = scale === 1 ? stem : `${stem}@${scale}x`;
    if (r.png)
      await page.screenshot({
        path: out(f.dir, `${base}.png`),
        omitBackground: true,
      });
    if (r.jpg)
      await page.screenshot({
        path: out(f.dir, `${base}.jpg`),
        type: "jpeg",
        quality: 94,
      });
  };

  for (const f of files) {
    for (const r of f.rasters) {
      await render(f, r, 1);
      if (r.scale && r.scale !== 1) await render(f, r, r.scale);
    }
  }
  await browser.close();

  // Outlined paths for the site's inline <Mark/> component.
  const m = markParts(WHITE);
  const ts = `// Generated by scripts/brand-kit.mjs — do not edit by hand.
// Google Sans Flex SemiBold "B" and "V", outlined, in a ${MARK.size}×${MARK.size} box.
export const MARK_SIZE = ${MARK.size};
export const MARK_STROKE = ${MARK.stroke};
export const MARK_B = { transform: "${m.paths.b.transform}", d: "${m.paths.b.d}" };
export const MARK_V = { transform: "${m.paths.v.transform}", d: "${m.paths.v.d}" };
`;
  writeFileSync(resolve(root, "src/components/markPaths.ts"), ts);

  // Site assets
  copyFileSync(
    out("favicon", "favicon.svg"),
    resolve(root, "public/favicon.svg"),
  );
  copyFileSync(
    out("favicon", "apple-touch-icon-180.png"),
    resolve(root, "public/apple-touch-icon.png"),
  );
  copyFileSync(
    out("social", "og-image-1200x630.png"),
    resolve(root, "public/og-image.png"),
  );

  console.log(`brand kit: ${files.length} SVGs + rasters written to /brand`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
