/**
 * Generates favicon / touch icon / PWA icons / Open Graph images from the
 * institutional crest (same geometry as src/components/InstitutionalCrest.tsx).
 * Output goes to public/ and is committed so deploys are deterministic; this
 * script simply keeps them in sync with the design source.
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pub = resolve(root, 'public');
const brand = resolve(pub, 'brand');
mkdirSync(brand, { recursive: true });

const GOLD = '#d4af37';
const AMBER = '#f59e0b';
const BG = '#030508';

/** Crest geometry (viewBox 0 0 100 100). `withText` toggles the ring inscription (illegible at icon sizes). */
function crestSvg({ size = 512, withText = true, background = true, padding = 0 } = {}) {
  const inner = 100 - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  ${background ? `<rect width="100" height="100" fill="${BG}"/>` : ''}
  <g transform="translate(${padding} ${padding}) scale(${inner / 100})">
  <circle cx="50" cy="50" r="47" fill="none" stroke="${GOLD}" stroke-width="1.2" stroke-dasharray="3 1.5"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.8"/>
  <circle cx="50" cy="50" r="39" fill="none" stroke="${GOLD}" stroke-width="0.6" opacity="0.6"/>
  ${withText ? `<defs><path id="c" d="M 50,50 m -41.5,0 a 41.5,41.5 0 1,1 83,0 a 41.5,41.5 0 1,1 -83,0"/></defs>
  <text fill="${GOLD}" font-size="3.8" letter-spacing="0.5" font-weight="600" opacity="0.85" font-family="STIX Two Text, Times New Roman, serif"><textPath href="#c" startOffset="50%" text-anchor="middle">ZAZIE INSTITUTE OF APPLIED ANOMALIES · EST 2021</textPath></text>` : ''}
  <path d="M 32 30 Q 50 27 68 30 V 54 Q 68 70 50 78 Q 32 70 32 54 Z" fill="#04070b" stroke="${GOLD}" stroke-width="1.4"/>
  <line x1="50" y1="30" x2="50" y2="78" stroke="${GOLD}" stroke-width="0.6" stroke-dasharray="1.5 1" opacity="0.7"/>
  <line x1="32" y1="50" x2="68" y2="50" stroke="${GOLD}" stroke-width="0.6" stroke-dasharray="1.5 1" opacity="0.7"/>
  <path d="M 36 41 Q 40 34 43 41 T 47 41" fill="none" stroke="${AMBER}" stroke-width="1" stroke-linecap="round"/>
  <path d="M 37 44 Q 41 38 43 44 T 46 44" fill="none" stroke="${AMBER}" stroke-width="0.7" opacity="0.6"/>
  <circle cx="59" cy="40" r="4.5" fill="none" stroke="${AMBER}" stroke-width="0.8"/>
  <line x1="59" y1="35.5" x2="59" y2="44.5" stroke="${AMBER}" stroke-width="0.6"/>
  <line x1="54.5" y1="40" x2="63.5" y2="40" stroke="${AMBER}" stroke-width="0.6"/>
  <ellipse cx="41" cy="60" rx="5" ry="2.2" transform="rotate(-30 41 60)" fill="none" stroke="${AMBER}" stroke-width="0.7"/>
  <ellipse cx="41" cy="60" rx="5" ry="2.2" transform="rotate(30 41 60)" fill="none" stroke="${AMBER}" stroke-width="0.7"/>
  <circle cx="41" cy="60" r="1" fill="${AMBER}"/>
  <path d="M 54 57 L 64 57 L 62 65 L 54 65 Z" fill="none" stroke="${AMBER}" stroke-width="0.8"/>
  <line x1="64" y1="56" x2="56" y2="67" stroke="${GOLD}" stroke-width="0.8"/>
  <path d="M 27 64 C 23 54 24 38 31 31" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.85"/>
  <circle cx="25" cy="58" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="24" cy="50" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="25" cy="42" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="28" cy="35" r="1" fill="${GOLD}" opacity="0.8"/>
  <path d="M 73 64 C 77 54 76 38 69 31" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.85"/>
  <circle cx="75" cy="58" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="76" cy="50" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="75" cy="42" r="1" fill="${GOLD}" opacity="0.8"/><circle cx="72" cy="35" r="1" fill="${GOLD}" opacity="0.8"/>
  <path d="M 26 80 Q 50 85 74 80 L 72 87 Q 50 91 28 87 Z" fill="#080c12" stroke="${GOLD}" stroke-width="0.9"/>
  ${withText ? `<text x="50" y="85.5" text-anchor="middle" fill="${GOLD}" font-size="3.2" font-weight="bold" letter-spacing="0.3" font-family="STIX Two Text, Times New Roman, serif">AUDITUS INAUDITI</text>` : ''}
  </g>
</svg>`;
}

/** Simplified mark for tiny favicon sizes: shield + ring, thicker strokes. */
function markSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="${BG}"/>
  <circle cx="50" cy="50" r="42" fill="none" stroke="${GOLD}" stroke-width="3"/>
  <path d="M 32 30 Q 50 26 68 30 V 54 Q 68 70 50 78 Q 32 70 32 54 Z" fill="#04070b" stroke="${GOLD}" stroke-width="3.5"/>
  <path d="M 38 52 Q 44 38 50 52 T 62 52" fill="none" stroke="${AMBER}" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;
}

const ogSvg = ({ title, subtitle, kicker }) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#060a12"/><stop offset="1" stop-color="#03060a"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.5" r="0.5"><stop offset="0" stop-color="#c5a059" stop-opacity="0.16"/><stop offset="1" stop-color="#c5a059" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#c5a059" stroke-opacity="0.07"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#2b3d54" stroke-width="2" rx="14"/>
  <g transform="translate(820 115) scale(4)">${crestSvg({ size: 100, withText: true, background: false }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
  <text x="72" y="120" font-family="STIX Two Text, Times New Roman, serif" font-size="20" letter-spacing="4" fill="#dfb76c" font-weight="700">${kicker}</text>
  <text x="72" y="220" font-family="STIX Two Text, Times New Roman, serif" font-size="58" font-weight="700" fill="#ffffff">${title[0]}</text>
  <text x="72" y="290" font-family="STIX Two Text, Times New Roman, serif" font-size="58" font-weight="700" fill="#ffffff">${title[1] ?? ''}</text>
  <text x="72" y="360" font-family="STIX Two Text, Times New Roman, serif" font-size="26" fill="#c5a059" font-style="italic">${subtitle}</text>
  <line x1="72" y1="410" x2="700" y2="410" stroke="#1f2b3c" stroke-width="2"/>
  <text x="72" y="455" font-family="STIX Two Text, Times New Roman, serif" font-size="22" fill="#a1a1aa">Applied Anomalies · Experimental Systems · Audio Technology</text>
  <text x="72" y="490" font-family="STIX Two Text, Times New Roman, serif" font-size="22" fill="#a1a1aa">Computational Creativity · Speculative Engineering</text>
  <text x="72" y="560" font-family="STIX Two Text, Times New Roman, serif" font-size="20" letter-spacing="3" fill="#6ee7b7" font-weight="700">ZAZIEINSTITUTE.ORG</text>
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 });

// SVG favicon (vector, sharp at any size, dark background baked in)
writeFileSync(resolve(pub, 'favicon.svg'), markSvg(64));
// Full crest as brand SVG
writeFileSync(resolve(brand, 'ziaa-crest.svg'), crestSvg({ size: 512 }));

await png(markSvg(64), 32).toFile(resolve(pub, 'favicon-32.png'));
await png(markSvg(64), 16).toFile(resolve(pub, 'favicon-16.png'));
await png(crestSvg({ size: 180, withText: false, padding: 6 }), 180).toFile(resolve(pub, 'apple-touch-icon.png'));
await png(crestSvg({ size: 192, withText: false, padding: 6 }), 192).toFile(resolve(pub, 'icon-192.png'));
await png(crestSvg({ size: 512, withText: true, padding: 4 }), 512).toFile(resolve(pub, 'icon-512.png'));
await png(crestSvg({ size: 512, withText: false, padding: 14 }), 512).toFile(resolve(pub, 'icon-512-maskable.png'));
await png(crestSvg({ size: 512, withText: true, padding: 2 }), 512).toFile(resolve(brand, 'ziaa-crest-512.png'));

// favicon.ico: multi-size container built from PNG frames
async function ico(sizes) {
  const frames = await Promise.all(sizes.map((s) => png(markSvg(64), s).toBuffer()));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  const entries = [];
  let offset = 6 + 16 * frames.length;
  frames.forEach((buf, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1);
    e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
    offset += buf.length; entries.push(e);
  });
  return Buffer.concat([header, ...entries, ...frames]);
}
writeFileSync(resolve(pub, 'favicon.ico'), await ico([16, 32, 48]));

// Open Graph images
const og = async (name, opts) => {
  const buf = Buffer.from(ogSvg(opts));
  await sharp(buf, { density: 144 }).resize(1200, 630).png({ compressionLevel: 9, palette: true }).toFile(resolve(brand, `${name}.png`));
};
await og('og-default', { kicker: 'ZIAA · INDEPENDENT RESEARCH &amp; CREATIVE-TECHNOLOGY INITIATIVE', title: ['Zazie Institute of', 'Applied Anomalies'], subtitle: 'Experimental research archive · prototypes · notes · monographs' });

// Web app manifest
const manifest = {
  name: 'Zazie Institute of Applied Anomalies (ZIAA)',
  short_name: 'ZIAA',
  description: 'Independent interdisciplinary research and creative-technology archive: experimental prototypes, audio research, computational creativity and speculative engineering.',
  id: '/',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'any',
  background_color: BG,
  theme_color: BG,
  lang: 'en',
  dir: 'ltr',
  categories: ['education', 'music', 'productivity'],
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ],
  shortcuts: [
    { name: 'Prototypes', url: '/prototypes', description: 'Experimental prototype archive' },
    { name: 'Research Notes', url: '/research-notes', description: 'Chronological lab notes' },
    { name: 'Acoustic Bench', url: '/acoustic-bench', description: 'Web Audio DSP workstation' }
  ]
};
writeFileSync(resolve(pub, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

if (!existsSync(resolve(pub, 'robots.txt'))) {
  console.warn('[brand] robots.txt missing');
}
console.log('[brand] icons, OG image and manifest written');
