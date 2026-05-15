const ALLOWED_TAGS = new Set([
  "a",
  "br",
  "b",
  "em",
  "h3",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);
const REMOVED_WITH_CONTENT_TAGS = new Set([
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "math",
  "meta",
  "object",
  "script",
  "select",
  "style",
  "svg",
  "textarea",
]);
const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function sanitizeHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  sanitizeChildren(template.content);
  return template.innerHTML;
}

function sanitizeChildren(parent) {
  Array.from(parent.childNodes).forEach((child) => sanitizeNode(child));
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return;

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.remove();
    return;
  }

  const tagName = node.tagName.toLowerCase();
  if (REMOVED_WITH_CONTENT_TAGS.has(tagName)) {
    node.remove();
    return;
  }

  sanitizeChildren(node);

  if (!ALLOWED_TAGS.has(tagName)) {
    unwrapElement(node);
    return;
  }

  sanitizeAttributes(node, tagName);
}

function sanitizeAttributes(element, tagName) {
  const href = tagName === "a" ? element.getAttribute("href") : "";

  Array.from(element.attributes).forEach((attribute) => {
    element.removeAttribute(attribute.name);
  });

  if (tagName !== "a") return;

  const safeHref = getSafeHref(href);
  if (!safeHref) {
    unwrapElement(element);
    return;
  }

  element.setAttribute("href", safeHref);
  element.setAttribute("target", "_blank");
  element.setAttribute("rel", "noopener noreferrer");
}

function getSafeHref(href) {
  if (!href) return "";

  try {
    const url = new URL(href, window.location.href);
    if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) return "";
    return href.trim();
  } catch {
    return "";
  }
}

function unwrapElement(element) {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  element.remove();
}
