#!/usr/bin/env node
/**
 * Turns a GitHub issue with attached photos into a Logbook album.
 *
 * Runs in .github/workflows/photos.yml. Reads the issue from environment
 * variables (never from the command line, so issue text can't inject into
 * the shell), downloads each attachment, resizes it, and writes
 * src/content/logbook/<album>/album.json plus the images.
 *
 * Issue format (see .github/ISSUE_TEMPLATE/add-photos.md):
 *   Title  → album name (e.g. "Thailand 2025"); a second issue with the
 *            same title adds to the same album.
 *   ## Place / ## Date / ## Caption → optional metadata.
 *   Images anywhere in the body → photos, in order. Text on the line
 *   right under an image becomes that photo's caption.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const title = (process.env.ISSUE_TITLE ?? '').trim();
const body = process.env.ISSUE_BODY ?? '';
const issueNumber = process.env.ISSUE_NUMBER ?? '0';
const createdAt = process.env.ISSUE_CREATED_AT ?? new Date().toISOString();
const token = process.env.GITHUB_TOKEN ?? '';

const MAX_EDGE = 2000;
const JPEG_QUALITY = 82;
const ALLOWED_HOSTS = new Set([
  'github.com',
  'user-images.githubusercontent.com',
  'private-user-images.githubusercontent.com',
  'objects.githubusercontent.com',
]);

const fail = (msg) => {
  console.error(`::error::${msg}`);
  process.exit(1);
};

// ---------- parse ----------

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const albumTitle =
  title.replace(/^(add|new)\s+photos?:?\s*/i, '').trim() || `Photos #${issueNumber}`;
const slug = slugify(albumTitle) || `photos-${issueNumber}`;

const section = (name) => {
  const m = body.match(new RegExp(`^#{1,3}\\s*${name}\\s*\\n([\\s\\S]*?)(?=^#{1,3}\\s|\\Z)`, 'im'));
  if (!m) return '';
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^\(.*\)$/.test(l) && !/^<!--/.test(l))
    .join(' ')
    .trim();
};
const place = section('Place');
const dateText = section('Date');
const albumCaption = section('Caption');

// Images in markdown or HTML form, in document order, with the line after each as caption.
const imgRe = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)|<img[^>]*src="(https?:\/\/[^"]+)"[^>]*>/g;
const attachments = [];
let m;
while ((m = imgRe.exec(body))) {
  const url = m[1] ?? m[2];
  const after = body.slice(m.index + m[0].length).split('\n');
  // first non-empty line after the image, unless it is another image or a heading
  let caption = '';
  for (const line of after.slice(0, 3)) {
    const t = line.trim();
    if (!t) continue;
    if (/^!\[|^<img|^#{1,3}\s/.test(t)) break;
    caption = t.replace(/^[-*]\s+/, '');
    break;
  }
  attachments.push({ url, caption });
}
if (!attachments.length) fail('No images found in the issue body.');
for (const a of attachments) {
  const host = new URL(a.url).hostname;
  if (!ALLOWED_HOSTS.has(host)) fail(`Refusing to download from ${host}`);
}

// ---------- dates ----------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
function parseDate(text) {
  const t = text.trim();
  let mm;
  if ((mm = t.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/)))
    return {
      sort: `${mm[1]}-${mm[2].padStart(2, '0')}-${(mm[3] ?? '01').padStart(2, '0')}`,
      label: `${LONG[+mm[2] - 1].slice(0, 3)} ${mm[1]}`,
    };
  if ((mm = t.match(/^([a-z]{3,9})\.?\s+(\d{4})$/i))) {
    const i = MONTHS.indexOf(mm[1].slice(0, 3).toLowerCase());
    if (i >= 0)
      return {
        sort: `${mm[2]}-${String(i + 1).padStart(2, '0')}-01`,
        label: `${LONG[i].slice(0, 3)} ${mm[2]}`,
      };
  }
  if ((mm = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)))
    return {
      sort: `${mm[3]}-${mm[1].padStart(2, '0')}-${mm[2].padStart(2, '0')}`,
      label: `${LONG[+mm[1] - 1].slice(0, 3)} ${mm[3]}`,
    };
  if ((mm = t.match(/^(\d{4})$/))) return { sort: `${mm[1]}-01-01`, label: mm[1] };
  const d = new Date(t);
  if (!Number.isNaN(d.getTime()))
    return {
      sort: d.toISOString().slice(0, 10),
      label: `${LONG[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`,
    };
  return null;
}
const parsed = dateText ? parseDate(dateText) : null;
const created = new Date(createdAt);
const fallback = {
  sort: created.toISOString().slice(0, 10),
  label: `${LONG[created.getUTCMonth()].slice(0, 3)} ${created.getUTCFullYear()}`,
};
const date = parsed ?? fallback;

// ---------- download + resize ----------

async function download(url) {
  const tryFetch = (headers) => fetch(url, { headers, redirect: 'follow' });
  let res = await tryFetch({ 'User-Agent': 'roaninpodkin-logbook' });
  if (!res.ok && token)
    res = await tryFetch({
      'User-Agent': 'roaninpodkin-logbook',
      Authorization: `Bearer ${token}`,
    });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const albumDir = path.join(ROOT, 'src', 'content', 'logbook', slug);
const albumFile = path.join(albumDir, 'album.json');
await mkdir(albumDir, { recursive: true });

let album;
try {
  await access(albumFile);
  album = JSON.parse(await readFile(albumFile, 'utf8'));
  console.log(`Adding to existing album "${album.title}"`);
} catch {
  album = { title: albumTitle, sortDate: date.sort, photos: [] };
}
if (place) album.place = place;
if (dateText || !album.date) album.date = date.label;
if (dateText) album.sortDate = date.sort;
if (albumCaption) album.caption = albumCaption;

const existing = new Set(album.photos.map((p) => p.src));
let n = album.photos.length;
const added = [];
const skipped = [];

for (const a of attachments) {
  let buf;
  try {
    buf = await download(a.url);
  } catch (e) {
    skipped.push(`${a.url} (${e.message})`);
    continue;
  }
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  let meta;
  try {
    meta = await sharp(buf).metadata();
  } catch {
    skipped.push(`${a.url} (not an image sharp can read)`);
    continue;
  }
  n += 1;
  const file = `${String(n).padStart(3, '0')}-${hash}.jpg`;
  const rel = `./${file}`;
  if (existing.has(rel)) {
    n -= 1;
    continue;
  }
  const out = await sharp(buf)
    .rotate() // honour EXIF orientation, then strip it
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  await writeFile(path.join(albumDir, file), out);
  const photo = { kind: 'image', src: rel };
  if (a.caption) photo.caption = a.caption;
  photo.alt = a.caption || `${albumTitle}, photo ${n}`;
  album.photos.push(photo);
  added.push(`${file} (${meta.width}×${meta.height} → ${Math.round(out.length / 1024)} KB)`);
}

if (!added.length) fail(`Nothing added. Skipped: ${skipped.join('; ') || 'none'}`);

await writeFile(albumFile, JSON.stringify(album, null, 2) + '\n');

const summary = [
  `album=${slug}`,
  `title=${album.title}`,
  `added=${added.length}`,
  `skipped=${skipped.length}`,
].join('\n');
if (process.env.GITHUB_OUTPUT)
  await writeFile(process.env.GITHUB_OUTPUT, summary + '\n', { flag: 'a' });
console.log(summary);
console.log(added.map((s) => `  + ${s}`).join('\n'));
if (skipped.length) console.log(skipped.map((s) => `  - skipped ${s}`).join('\n'));
