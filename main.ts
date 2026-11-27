// News image for Friday 27 November 2026: a newspaper front page drawn in code.
// Standard library only. Writes a 1024x1024 PNG to the output directory.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1024;
const H = 1024;
type RGB = [number, number, number];
const PAPER: RGB = [247, 242, 231];
const INK: RGB = [17, 17, 17];
const RED: RGB = [185, 28, 28];
const NAVY: RGB = [30, 58, 95];
const TEAL: RGB = [13, 110, 110];
const AMBER: RGB = [180, 110, 10];
const GREY: RGB = [90, 90, 90];
const LIGHT: RGB = [255, 255, 255];
const TAN: RGB = [232, 222, 200];

const px = new Uint8Array(W * H * 3);
function set(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, c);
}
function frame(x: number, y: number, w: number, h: number, c: RGB, t = 3): void {
  rect(x, y, w, t, c); rect(x, y + h - t, w, t, c);
  rect(x, y, t, h, c); rect(x + w - t, y, t, h, c);
}
function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) set(x, y, c);
  }
}
function ring(cx: number, cy: number, r: number, c: RGB, t = 4): void {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (Math.abs(d - r) <= t / 2) set(x, y, c);
  }
}
function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 3): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + ((x1 - x0) * s) / steps);
    const y = Math.round(y0 + ((y1 - y0) * s) / steps);
    disc(x, y, Math.floor(t / 2), c);
  }
}

// 5x7 bitmap font, defined for this entry.
const F: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", "#...."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "%": ["##..#", "##.#.", "....#", "...#.", "..#..", ".#...", "#..##"],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "$": ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
};
function textW(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawText(s: string, x: number, y: number, scale: number, c: RGB): void {
  const up = s.toUpperCase();
  for (let n = 0; n < up.length; n++) {
    const g = F[up[n]] ?? F[" "];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if (g[r][col] === "#") rect(x + n * 6 * scale + col * scale, y + r * scale, scale, scale, c);
    }
  }
}
function centered(s: string, y: number, scale: number, c: RGB): void {
  drawText(s, Math.round((W - textW(s, scale)) / 2), y, scale, c);
}
function wrap(s: string, maxChars: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
function block(tag: string, head: string, body: string, x: number, y: number, w: number, accent: RGB): void {
  frame(x, y, w, 148, INK, 3);
  rect(x, y, w, 30, accent);
  drawText(tag, x + 12, y + 5, 3, LIGHT);
  const hl = wrap(head, 24);
  hl.slice(0, 2).forEach((ln, i) => drawText(ln, x + 12, y + 40 + i * 26, 3, INK));
  const bl = wrap(body, 34);
  bl.slice(0, 2).forEach((ln, i) => drawText(ln, x + 12, y + 100 + i * 20, 2, GREY));
  disc(x + w - 26, y + 122, 9, accent);
}

// ---- compose the front page ----
rect(0, 0, W, H, PAPER);
rect(0, 0, W, 10, INK);
centered("THE WORLD TODAY", 26, 9, INK);
centered("FRIDAY 27 NOVEMBER 2026", 102, 4, RED);
rect(36, 140, W - 72, 4, INK);
centered("ONE DAY. EVERY REGION. WHAT HAPPENED.", 152, 2, GREY);

// Lead story
const lx = 36, ly = 182, lw = W - 72, lh = 248;
frame(lx, ly, lw, lh, INK, 4);
rect(lx, ly, lw, 36, RED);
drawText("LEAD STORY - MIDDLE EAST", lx + 16, ly + 7, 3, LIGHT);
// drone icon, kept clear of the headline
const dx = lx + lw - 105, dy = ly + 185;
line(dx - 42, dy - 28, dx + 42, dy + 28, NAVY, 5);
line(dx + 42, dy - 28, dx - 42, dy + 28, NAVY, 5);
disc(dx, dy, 12, RED);
ring(dx - 42, dy - 28, 14, NAVY, 4); ring(dx + 42, dy - 28, 14, NAVY, 4);
ring(dx - 42, dy + 28, 14, NAVY, 4); ring(dx + 42, dy + 28, 14, NAVY, 4);
drawText("DRONE STRIKE KILLS", lx + 20, ly + 52, 5, INK);
drawText("TWO ITALIANS IN KUWAIT", lx + 20, ly + 96, 5, INK);
drawText("TWO TECHNICIANS DIED AT A", lx + 20, ly + 146, 3, GREY);
drawText("KUWAITI MILITARY SITE. KUWAIT", lx + 20, ly + 170, 3, GREY);
drawText("AND ITALY BLAME IRAN.", lx + 20, ly + 194, 3, GREY);
drawText("TEHRAN DENIES INVOLVEMENT.", lx + 20, ly + 218, 3, GREY);

// Secondary grid
const gx = 36, gy = 452, gw = (W - 72 - 16) / 2;
block("NORTH AMERICA", "THANKSGIVING STORMS CUT POWER", "BOTH US COASTS HIT. 800,000+ CUSTOMERS LOST POWER.", gx, gy, gw, NAVY);
block("CLIMATE - GLOBAL", "EARTH ABOVE 2C FOR 7 DAYS", "HEAT PASSED 2C ABOVE PRE-INDUSTRIAL LEVELS FOR A WEEK.", gx + gw + 16, gy, gw, RED);
block("AFRICA - HEALTH", "HIV SHOT REACHES AFRICA", "TWICE-YEARLY SHOT, NEARLY 100% EFFECTIVE, HAS ARRIVED.", gx, gy + 164, gw, TEAL);
block("ASIA - SECURITY", "CHINA TESTS TAIWAN LANDING", "SHIPS FORMED A FLOATING BRIDGE IN COASTAL DRILLS.", gx + gw + 16, gy + 164, gw, NAVY);
block("OCEANIA - POLITICS", "NZ COALITION ONE SEAT SHORT", "65 SEATS WON. ONE SHORT OF A MAJORITY.", gx, gy + 328, gw, AMBER);
block("EUROPE - ECONOMY", "DE COS TO LEAD ECB", "SPAIN'S DE COS CHOSEN FOR EUROPEAN CENTRAL BANK.", gx + gw + 16, gy + 328, gw, TEAL);

// Footer ticker
rect(36, 958, W - 72, 40, INK);
drawText("BRENT $92.30  SINNER OUT OF AUSTRALIAN OPEN - KNEE", 52, 969, 3, LIGHT);

// ---- PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
const raw = new Uint8Array(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
}
const ihdr = new Uint8Array(13);
const idv = new DataView(ihdr.buffer);
idv.setUint32(0, W); idv.setUint32(4, H);
ihdr[8] = 8; ihdr[9] = 2;
const pngParts = [
  new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", new Uint8Array(0)),
];
const total = pngParts.reduce((a, p) => a + p.length, 0);
const png = new Uint8Array(total);
let off = 0;
for (const p of pngParts) { png.set(p, off); off += p.length; }
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), png);
