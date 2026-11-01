const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svgContent = fs.readFileSync(path.join(publicDir, 'icon.svg'), 'utf-8');

// 1. Standard 192x192
const resvg192 = new Resvg(svgContent, { fitTo: { mode: 'width', value: 192 } });
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), resvg192.render().asPng());

// 2. Standard 512x512
const resvg512 = new Resvg(svgContent, { fitTo: { mode: 'width', value: 512 } });
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), resvg512.render().asPng());

// 3. Apple Touch Icon 180x180
const resvg180 = new Resvg(svgContent, { fitTo: { mode: 'width', value: 180 } });
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), resvg180.render().asPng());

// 4. Maskable 512x512 with safe-zone margin (15% padding on all sides, 512x512 background)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#mbg)" />
  <g transform="translate(64, 64) scale(0.75)">
    ${svgContent.replace(/<\/?svg[^>]*>/g, '')}
  </g>
</svg>
`;
const resvgMaskable = new Resvg(maskableSvg, { fitTo: { mode: 'width', value: 512 } });
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), resvgMaskable.render().asPng());

// Also create favicon.ico as a copy of 192 png
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), resvg192.render().asPng());

console.log('Successfully generated all PWA icons!');
