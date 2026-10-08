const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function encodePNG(width, height, rgbaBuffer) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    rawData[y * (stride + 1)] = 0;
    rgbaBuffer.copy(rawData, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// 2D Capsule Distance & Projection
function evalCapsule(px, py, ax, ay, bx, by, r) {
  const bax = bx - ax;
  const bay = by - ay;
  const pax = px - ax;
  const pay = py - ay;
  const lenSq = bax * bax + bay * bay;
  let t = 0;
  if (lenSq > 0) {
    t = (pax * bax + pay * bay) / lenSq;
  }
  const tClamped = Math.max(0, Math.min(1, t));
  const qx = ax + tClamped * bax;
  const qy = ay + tClamped * bay;
  const dx = px - qx;
  const dy = py - qy;
  const dist = Math.sqrt(dx * dx + dy * dy) - r;
  return { dist, t };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function renderHighResLogo(size, paddingRatio = 0.08, bgColor = null) {
  const buf = Buffer.alloc(size * size * 4);

  // The glyph coordinates in the original 39x39 reference grid:
  // Glyph center is exactly at (18.0, 18.0).
  // Visual width & height is ~35.5 units.
  const padding = size * paddingRatio;
  const available = size - 2 * padding;
  const scale = available / 35.5;

  const originX = size / 2.0;
  const originY = size / 2.0;

  function toScreen(gx, gy) {
    return [
      originX + (gx - 18.0) * scale,
      originY + (gy - 18.0) * scale,
    ];
  }

  // Capsule segment length and radius
  const segHalf = 5.15 * scale;
  const capRadius = 6.25 * scale;

  // 1. Purple Capsule (Horizontal, Top)
  // Center: (24.2, 5.9), dir = (1, 0)
  const [pcx, pcy] = toScreen(24.2, 5.9);
  const pA = [pcx - segHalf, pcy];
  const pB = [pcx + segHalf, pcy];

  // 2. Blue Capsule (Tilted from Top-Left to Bottom-Right, Angle +60 deg)
  // Center: (7.5, 14.9), dir = (0.5, 0.866)
  const [bcx, bcy] = toScreen(7.5, 14.9);
  const cos60 = 0.5;
  const sin60 = 0.8660254;
  const bA = [bcx - segHalf * cos60, bcy - segHalf * sin60];
  const bB = [bcx + segHalf * cos60, bcy + segHalf * sin60];

  // 3. Orange Capsule (Tilted from Top-Right to Bottom-Left, Angle 120 deg)
  // Center: (23.5, 25.1), dir = (-0.5, 0.866)
  const [ocx, ocy] = toScreen(23.5, 25.1);
  const oA = [ocx + segHalf * cos60, ocy - segHalf * sin60];
  const oB = [ocx - segHalf * cos60, ocy + segHalf * sin60];

  // 4x4 subpixel super-sampling (16 jittered rays per pixel) for supreme cinema-quality anti-aliasing
  const subOffsets = [
    [-0.375, -0.375], [-0.125, -0.375], [0.125, -0.375], [0.375, -0.375],
    [-0.375, -0.125], [-0.125, -0.125], [0.125, -0.125], [0.375, -0.125],
    [-0.375,  0.125], [-0.125,  0.125], [0.125,  0.125], [0.375,  0.125],
    [-0.375,  0.375], [-0.125,  0.375], [0.125,  0.375], [0.375,  0.375],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let accR = 0, accG = 0, accB = 0, accA = 0;

      for (let s = 0; s < 16; s++) {
        const px = x + 0.5 + subOffsets[s][0];
        const py = y + 0.5 + subOffsets[s][1];

        const ep = evalCapsule(px, py, pA[0], pA[1], pB[0], pB[1], capRadius);
        const eb = evalCapsule(px, py, bA[0], bA[1], bB[0], bB[1], capRadius);
        const eo = evalCapsule(px, py, oA[0], oA[1], oB[0], oB[1], capRadius);

        // Find closest capsule
        let minDist = ep.dist;
        let best = 'purple';
        let bestT = ep.t;

        if (eb.dist < minDist) {
          minDist = eb.dist;
          best = 'blue';
          bestT = eb.t;
        }
        if (eo.dist < minDist) {
          minDist = eo.dist;
          best = 'orange';
          bestT = eo.t;
        }

        if (minDist <= 0) {
          accA += 1;
          const u = Math.max(0, Math.min(1, bestT));

          if (best === 'purple') {
            // #7335BD -> #843EB0
            accR += lerp(115, 132, u);
            accG += lerp(53, 62, u);
            accB += lerp(189, 176, u);
          } else if (best === 'blue') {
            // #31A9CB -> #206AC2
            accR += lerp(49, 32, u);
            accG += lerp(169, 106, u);
            accB += lerp(203, 194, u);
          } else if (best === 'orange') {
            // #FAB639 -> #F98231
            accR += lerp(250, 249, u);
            accG += lerp(182, 130, u);
            accB += lerp(57, 49, u);
          }
        }
      }

      if (accA > 0 || bgColor) {
        const outA = accA / 16.0;
        let outR = accA > 0 ? Math.round(accR / accA) : 0;
        let outG = accA > 0 ? Math.round(accG / accA) : 0;
        let outB = accA > 0 ? Math.round(accB / accA) : 0;

        const idx = (y * size + x) * 4;
        if (bgColor) {
          outR = Math.round(lerp(bgColor[0], outR, outA));
          outG = Math.round(lerp(bgColor[1], outG, outA));
          outB = Math.round(lerp(bgColor[2], outB, outA));
          buf[idx] = outR;
          buf[idx + 1] = outG;
          buf[idx + 2] = outB;
          buf[idx + 3] = 255;
        } else if (outA > 0) {
          buf[idx] = outR;
          buf[idx + 1] = outG;
          buf[idx + 2] = outB;
          buf[idx + 3] = Math.round(outA * 255);
        }
      }
    }
  }

  return encodePNG(size, size, buf);
}

function renderBadgeLogo(size, options = {}) {
  const {
    boxScale = 0.56,       // Box takes 56% of canvas (573px on 1024)
    cornerRadius = 0.23,   // Corner radius ratio relative to box size (~132px)
    logoScale = 0.64,      // Logo takes 64% of box size (~366px)
    shadow = true,
    bgCanvas = null,       // null = transparent canvas
  } = options;

  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2.0;
  const cy = size / 2.0;

  const boxSize = size * boxScale;
  const halfBox = boxSize / 2.0;
  const r = boxSize * cornerRadius;
  const qx = halfBox - r;
  const qy = halfBox - r;
  const borderWidth = Math.max(1.5, size * 0.0035); // ~3.5px on 1024

  // Logo setup inside the box
  const logoTargetSize = boxSize * logoScale;
  const scale = logoTargetSize / 35.5;
  const segHalf = 5.15 * scale;
  const capRadius = 6.25 * scale;

  function toScreen(gx, gy) {
    return [
      cx + (gx - 18.0) * scale,
      cy + (gy - 18.0) * scale,
    ];
  }

  // Capsule endpoints
  const [pcx, pcy] = toScreen(24.2, 5.9);
  const pA = [pcx - segHalf, pcy];
  const pB = [pcx + segHalf, pcy];

  const cos60 = 0.5;
  const sin60 = 0.8660254;
  const [bcx, bcy] = toScreen(7.5, 14.9);
  const bA = [bcx - segHalf * cos60, bcy - segHalf * sin60];
  const bB = [bcx + segHalf * cos60, bcy + segHalf * sin60];

  const [ocx, ocy] = toScreen(23.5, 25.1);
  const oA = [ocx + segHalf * cos60, ocy - segHalf * sin60];
  const oB = [ocx - segHalf * cos60, ocy + segHalf * sin60];

  const subOffsets = [
    [-0.375, -0.375], [-0.125, -0.375], [0.125, -0.375], [0.375, -0.375],
    [-0.375, -0.125], [-0.125, -0.125], [0.125, -0.125], [0.375, -0.125],
    [-0.375,  0.125], [-0.125,  0.125], [0.125,  0.125], [0.375,  0.125],
    [-0.375,  0.375], [-0.125,  0.375], [0.125,  0.375], [0.375,  0.375],
  ];

  const shadowOffsetY = size * 0.014; // ~14px on 1024
  const shadowBlur = size * 0.038;    // ~39px on 1024
  const shadowMaxA = 0.16;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let accR = 0, accG = 0, accB = 0, accA = 0;

      for (let s = 0; s < 16; s++) {
        const px = x + 0.5 + subOffsets[s][0];
        const py = y + 0.5 + subOffsets[s][1];

        // Box distance
        const bdx = Math.max(Math.abs(px - cx) - qx, 0);
        const bdy = Math.max(Math.abs(py - cy) - qy, 0);
        const distBox = Math.sqrt(bdx * bdx + bdy * bdy) - r;

        if (distBox <= 0) {
          // Inside the rounded box
          // Check pills
          const ep = evalCapsule(px, py, pA[0], pA[1], pB[0], pB[1], capRadius);
          const eb = evalCapsule(px, py, bA[0], bA[1], bB[0], bB[1], capRadius);
          const eo = evalCapsule(px, py, oA[0], oA[1], oB[0], oB[1], capRadius);

          let minDist = ep.dist;
          let best = 'purple';
          let bestT = ep.t;

          if (eb.dist < minDist) {
            minDist = eb.dist;
            best = 'blue';
            bestT = eb.t;
          }
          if (eo.dist < minDist) {
            minDist = eo.dist;
            best = 'orange';
            bestT = eo.t;
          }

          if (minDist <= 0) {
            // Inside a pill
            accA += 1;
            const u = Math.max(0, Math.min(1, bestT));
            if (best === 'purple') {
              accR += lerp(115, 132, u);
              accG += lerp(53, 62, u);
              accB += lerp(189, 176, u);
            } else if (best === 'blue') {
              accR += lerp(49, 32, u);
              accG += lerp(169, 106, u);
              accB += lerp(203, 194, u);
            } else if (best === 'orange') {
              accR += lerp(250, 249, u);
              accG += lerp(182, 130, u);
              accB += lerp(57, 49, u);
            }
          } else {
            // Box surface
            accA += 1;
            if (distBox >= -borderWidth) {
              // Subtle border #E2E8F0 (226, 232, 240)
              const borderT = (distBox + borderWidth) / borderWidth;
              accR += lerp(255, 226, borderT);
              accG += lerp(255, 232, borderT);
              accB += lerp(255, 240, borderT);
            } else {
              // Clean card background #FFFFFF
              accR += 255;
              accG += 255;
              accB += 255;
            }
          }
        } else {
          // Outside the box
          if (shadow) {
            const sdx = Math.max(Math.abs(px - cx) - (qx + 6), 0);
            const sdy = Math.max(Math.abs(py - (cy + shadowOffsetY)) - (qy + 6), 0);
            const distShadow = Math.sqrt(sdx * sdx + sdy * sdy) - r;
            if (distShadow < shadowBlur * 3) {
              const sFactor = Math.exp(-(distShadow * distShadow) / (2 * shadowBlur * shadowBlur));
              const shA = sFactor * shadowMaxA;
              accA += shA;
              // Slate shadow tint (15, 23, 42)
              accR += 15 * shA;
              accG += 23 * shA;
              accB += 42 * shA;
            }
          }
        }
      }

      const outA = accA / 16.0;
      let outR = accA > 0 ? Math.round(accR / accA) : 0;
      let outG = accA > 0 ? Math.round(accG / accA) : 0;
      let outB = accA > 0 ? Math.round(accB / accA) : 0;

      const idx = (y * size + x) * 4;
      if (bgCanvas) {
        outR = Math.round(lerp(bgCanvas[0], outR, outA));
        outG = Math.round(lerp(bgCanvas[1], outG, outA));
        outB = Math.round(lerp(bgCanvas[2], outB, outA));
        buf[idx] = outR;
        buf[idx + 1] = outG;
        buf[idx + 2] = outB;
        buf[idx + 3] = 255;
      } else {
        if (outA > 0) {
          buf[idx] = outR;
          buf[idx + 1] = outG;
          buf[idx + 2] = outB;
          buf[idx + 3] = Math.min(255, Math.round(outA * 255));
        }
      }
    }
  }

  return encodePNG(size, size, buf);
}

console.log('Rendering 1024x1024 crystal-clear anti-aliased assets...');
// 1. In-app logo: transparent, fills container nicely (standalone 3-pill logo)
const logoPng = renderHighResLogo(1024, 0.08, null);

// 2. Android adaptive icon: round white card badge with logo strictly within safe zone
const adaptivePng = renderBadgeLogo(1024, {
  boxScale: 0.58,
  cornerRadius: 0.24,
  logoScale: 0.65,
  shadow: true,
  bgCanvas: null,
});

// 3. Splash screen icon: round box with inner logo, zero shadow opacity
const splashPng = renderBadgeLogo(1024, {
  boxScale: 0.58,
  cornerRadius: 0.24,
  logoScale: 0.65,
  shadow: false,
  bgCanvas: null,
});

// 4. App Store / Launcher icon: round white box with inner logo with safe margins
const iconPng = renderBadgeLogo(1024, {
  boxScale: 0.58,
  cornerRadius: 0.24,
  logoScale: 0.65,
  shadow: true,
  bgCanvas: [255, 255, 255],
});

// 5. Web Favicon: 256x256 badge
const faviconPng = renderBadgeLogo(256, {
  boxScale: 0.85,
  cornerRadius: 0.24,
  logoScale: 0.68,
  shadow: false,
  bgCanvas: null,
});

fs.writeFileSync('d:/Ronojobs/mobile/assets/logo.png', logoPng);
fs.writeFileSync('d:/Ronojobs/mobile/assets/adaptive-icon.png', adaptivePng);
fs.writeFileSync('d:/Ronojobs/mobile/assets/splash-icon.png', splashPng);
fs.writeFileSync('d:/Ronojobs/mobile/assets/icon.png', iconPng);
fs.writeFileSync('d:/Ronojobs/mobile/assets/favicon.png', faviconPng);
console.log('Successfully saved badge-style splash and app icons!');

