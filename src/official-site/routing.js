export const OFFICIAL_PREVIEW_PREFIX = "/official-preview";
export const DIAGNOSIS_PATH = "/diagnosis";

const productionOfficialPattern = /^\/(?:about|how-to-use|types(?:\/[a-z-]+)?|why-nextory11|philosophy)?$/;

export function normalizePathname(pathname = window.location.pathname) {
  return pathname.replace(/\/$/, "") || "/";
}

export function isPreviewPath(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  return normalized === OFFICIAL_PREVIEW_PREFIX || normalized.startsWith(`${OFFICIAL_PREVIEW_PREFIX}/`);
}

export function isOfficialSitePath(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  return isPreviewPath(normalized) || productionOfficialPattern.test(normalized);
}

export function toPreviewRoute(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  if (isPreviewPath(normalized)) return normalized;
  return normalized === "/" ? OFFICIAL_PREVIEW_PREFIX : `${OFFICIAL_PREVIEW_PREFIX}${normalized}`;
}

export function toOfficialHref(previewHref) {
  if (isPreviewPath()) return previewHref;
  const normalized = normalizePathname(previewHref);
  if (normalized === OFFICIAL_PREVIEW_PREFIX) return "/";
  return normalized.startsWith(`${OFFICIAL_PREVIEW_PREFIX}/`)
    ? normalized.slice(OFFICIAL_PREVIEW_PREFIX.length)
    : normalized;
}
