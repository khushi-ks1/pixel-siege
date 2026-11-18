// Pixel-art sprites defined as text grids. Each character is a palette color,
// '.' is transparent. Grids are turned into small canvases once at startup.

const PALETTE = {
  k: '#1a1c2c', // outline
  s: '#f4c09a', // skin
  h: '#5d275d', // hair
  b: '#3b5dc9', // shirt
  B: '#29366f', // shirt dark
  p: '#333c57', // pants
  w: '#f4f4f4', // white
  g: '#38b764', // green
  G: '#257179', // dark teal
  r: '#b13e53', // red
  n: '#7a4a2b', // brown
  R: '#ef7d57', // orange
  y: '#ffcd75', // yellow
  a: '#566c86', // gray
  A: '#333c57', // dark gray
  l: '#94b0c2', // light gray
  c: '#73eff7', // cyan
  C: '#3b5dc9', // blue
  x: '#e43b44', // heart red
};

const SPRITES = {};

function build(rows, pal = {}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]] ?? PALETTE[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

function silhouette(src, color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

function add(name, frames, pal) {
  SPRITES[name] = frames.map((rows) => {
    const img = build(rows, pal);
    return { img, white: silhouette(img) };
  });
}

// ---------- Player ----------
const P_HEAD_FRONT = [
  '....kkkk....',
  '...khhhhk...',
  '..khhhhhhk..',
  '..khsssshk..',
  '..kskssksk..',
  '..kssssssk..',
  '...kssssk...',
];
const P_HEAD_BACK = [
  '....kkkk....',
  '...khhhhk...',
  '..khhhhhhk..',
  '..khhhhhhk..',
  '..khhhhhhk..',
  '..kkhhhhkk..',
  '...kssssk...',
];
const P_BODY = [
  '..kbbbbbbk..',
  '.ksbbbbbbsk.',
  '.ksbBbbBbsk.',
];
const P_LEGS_IDLE = [
  '..kppppppk..',
  '..kppkkppk..',
  '..kpk..kpk..',
  '..kk....kk..',
];
const P_LEGS_W1 = [
  '..kppppppk..',
  '.kppk..kppk.',
  '.kpk....kk..',
  '.kk.........',
];
const P_LEGS_W2 = [
  '..kppppppk..',
  '.kppk..kppk.',
  '..kk....kpk.',
  '.........kk.',
];

// Frames: 0-1 idle (breathing), 2-5 walk cycle
function playerFrames(head) {
  const idle = [...head, ...P_BODY, ...P_LEGS_IDLE];
  const idle2 = ['............', ...head, P_BODY[0], P_BODY[2], ...P_LEGS_IDLE];
  const w1 = [...head, ...P_BODY, ...P_LEGS_W1];
  const w2 = [...head, ...P_BODY, ...P_LEGS_W2];
  return [idle, idle2, w1, idle, w2, idle];
}

const GUN = [
  '.kkkkkkk',
  'kllllllk',
  'kakkkkk.',
  'kk......',
];

// ---------- Enemies ----------
const GRUNT_TOP = [
  '...kkkk...',
  '..kggggk..',
  '.kgrggrgk.',
  '.kggggggk.',
  '..kgkkgk..',
  '.kknnnnkk.',
  'kgknnnnkgk',
  'kgknnnnkgk',
  '.kknnnnkk.',
  '..kGGGGk..',
];
const GRUNT = [
  [...GRUNT_TOP, '..kGkkGk..', '..kk..kk..'],
  [...GRUNT_TOP, '..kGk.kGk.', '..kk...kk.'],
];

const RUNNER = [
  [
    'k......k',
    'kRk..kRk',
    '.kRRRRk.',
    'kRyRRyRk',
    'kRRRRRRk',
    'kRkkkkRk',
    '.kRRRRk.',
    'kRk..kRk',
    'kk....kk',
  ],
  [
    'k......k',
    'kRk..kRk',
    '.kRRRRk.',
    'kRyRRyRk',
    'kRRRRRRk',
    'kRkkkkRk',
    '.kRRRRk.',
    '.kRkkRk.',
    '.kk..kk.',
  ],
];

const TANK_TOP = [
  '....kkkkkk....',
  '...kaaaaaak...',
  '..kaayaayaak..',
  '..kaaaaaaaak..',
  '.kkakkkkkkakk.',
  'kaakAAAAAAkaak',
  'kaakAAAAAAkaak',
  'kaakAAAAAAkaak',
  'kkkkAAAAAAkkkk',
  '...kAAAAAAk...',
  '...kAAkkAAk...',
];
const TANK = [
  [...TANK_TOP, '...kAk..kAk...', '..kkAk..kAkk..', '..kkk....kkk..'],
  [...TANK_TOP, '..kAk....kAk..', '..kkk....kkk..', '..............'],
];

const SHOOTER_TOP = [
  '...kkkk...',
  '..kwwwwk..',
  '.kwkwwkwk.',
  '.kwwwwwwk.',
  '..kwkkwk..',
  '.kCCCCCCk.',
  'kCCcCCcCCk',
  'kCCCCCCCCk',
  '.kCCCCCCk.',
];
const SHOOTER = [
  [...SHOOTER_TOP, '.kCCkkCCk.', '.kkk..kkk.'],
  [...SHOOTER_TOP, '.kCCCCCCk.', '..kkkkkk..'],
];

// ---------- UI ----------
const HEART = [
  '.kk.kk.',
  'kxxkxxk',
  'kxxxxxk',
  '.kxxxk.',
  '..kxk..',
  '...k...',
];

// Power-up badges: lightning bolt (rapid fire) and a three-prong fan (triple shot)
const POWER_RAPID = [
  '.kkkkkkk.',
  'kyyyykkyk',
  'kyyykkyyk',
  'kyykkyyyk',
  'kykkkkkyk',
  'kyyykkyyk',
  'kyykkyyyk',
  'kykkyyyyk',
  '.kkkkkkk.',
];
const POWER_SPREAD = [
  '.kkkkkkk.',
  'kcCcCcCck',
  'kcCcCcCck',
  'kccCCCcck',
  'kcccCccck',
  'kcccCccck',
  'kccCCCcck',
  'kccccccck',
  '.kkkkkkk.',
];

export function initSprites() {
  add('powerRapid', [POWER_RAPID]);
  add('powerSpread', [POWER_SPREAD]);
  add('playerFront', playerFrames(P_HEAD_FRONT));
  add('playerBack', playerFrames(P_HEAD_BACK));
  add('gun', [GUN]);
  add('grunt', GRUNT);
  add('runner', RUNNER);
  add('tank', TANK);
  add('shooter', SHOOTER);
  add('boss', TANK, { a: '#b13e53', A: '#5d275d', y: '#73eff7' });
  add('heart', [HEART]);
  add('heartEmpty', [HEART], { x: '#333c57' });
}

export function spriteImg(name, frame = 0) {
  const f = SPRITES[name];
  return f[frame % f.length].img;
}

export function spriteSize(name) {
  const img = SPRITES[name][0].img;
  return { w: img.width, h: img.height };
}

// Draws a sprite centered on (x, y)
export function drawSprite(ctx, name, frame, x, y, { flip = false, flash = false, scale = 1, alpha = 1 } = {}) {
  const frames = SPRITES[name];
  const f = frames[frame % frames.length];
  const img = flash ? f.white : f.img;
  const w = img.width * scale, h = img.height * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -Math.floor(w / 2), -Math.floor(h / 2), w, h);
  ctx.restore();
}
