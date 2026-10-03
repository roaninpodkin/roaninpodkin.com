/**
 * Hand-drawn-feeling sea chart primitives. Everything is seeded so the map
 * renders identically on every build.
 */

export type Pt = [number, number];

/** Small, fast deterministic PRNG. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => Math.round(n * 10) / 10;

/** Closed Catmull-Rom spline through points, as an SVG path. */
export function closedSpline(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return '';
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1[0])} ${fmt(c1[1])}, ${fmt(c2[0])} ${fmt(c2[1])}, ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d + ' Z';
}

/** Open Catmull-Rom spline through points, as an SVG path. */
export function openSpline(pts: Pt[]): string {
  const n = pts.length;
  if (n < 2) return '';
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1[0])} ${fmt(c1[1])}, ${fmt(c2[0])} ${fmt(c2[1])}, ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d;
}

export interface IslandOpts {
  /** Radius scale (1 = base radius). */
  scale?: number;
  /** Number of control points around the shore. */
  points?: number;
  /** How ragged the coastline is, 0–1. */
  rough?: number;
  /** Horizontal stretch. */
  stretch?: number;
}

/** An organic island outline centred on (cx, cy). */
export function islandPath(
  cx: number,
  cy: number,
  r: number,
  seed: number,
  { scale = 1, points = 14, rough = 0.42, stretch = 1.2 }: IslandOpts = {},
): string {
  const rnd = mulberry32(seed);
  const pts: Pt[] = [];
  const rr = r * scale;
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + rnd() * 0.12;
    const wobble = 1 - rough / 2 + rnd() * rough;
    pts.push([cx + Math.cos(a) * rr * wobble * stretch, cy + Math.sin(a) * rr * wobble]);
  }
  return closedSpline(pts);
}

/** Scattered depth soundings for chart texture. */
export function soundings(
  count: number,
  seed: number,
  w: number,
  h: number,
  avoid: { x: number; y: number; r: number }[],
): { x: number; y: number; v: number }[] {
  const rnd = mulberry32(seed);
  const out: { x: number; y: number; v: number }[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 20) {
    const x = 40 + rnd() * (w - 80);
    const y = 40 + rnd() * (h - 80);
    if (avoid.some((a) => Math.hypot(a.x - x, a.y - y) < a.r * 2.6)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < 46)) continue;
    out.push({ x, y, v: 8 + Math.round(rnd() * 60) });
  }
  return out;
}
