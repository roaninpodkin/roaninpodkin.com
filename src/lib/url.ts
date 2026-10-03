/**
 * Base-aware link helper. The site is served from "/" in production, but
 * construction-mode deploys also publish the real build under a preview
 * sub-path, so every internal link must go through here.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function href(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${base}${path}`;
}

/** Strip the base prefix from a pathname (for canonical URLs). */
export function stripBase(pathname: string): string {
  if (base && pathname.startsWith(base)) return pathname.slice(base.length) || '/';
  return pathname;
}
