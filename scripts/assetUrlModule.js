export function toAssetUrl(value) {
  const url = typeof value === "string" ? value.trim().replace(/\\/g, "/") : "";
  if (!url || /^(?:data:|blob:|https?:)/i.test(url)) return url;

  const [, pathname = "", suffix = ""] = url.match(/^([^?#]*)([?#].*)?$/) || [];
  return pathname
    .split("/")
    .map(encodePathSegment)
    .join("/") + suffix;
}

function encodePathSegment(segment) {
  if (!segment) return segment;

  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch (_error) {
    return encodeURIComponent(segment);
  }
}
