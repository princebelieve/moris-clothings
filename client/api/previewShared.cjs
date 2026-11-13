const SITE_URL = (process.env.SITE_URL || "https://morisclothing.co.uk").replace(/\/$/, "");
const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
const imageUrl = image => image && /^https?:\/\//i.test(image) ? image : `${SITE_URL}${image?.startsWith("/") ? image : `/${image || "preview.png"}`}`;

function setMeta(html, attribute, key, value) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const matcher = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*\\/?\\s*>`, "i");
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

function renderPreviewPage(template, { type, id, record }) {
  const isArticle = type === "blog";
  const path = `/${isArticle ? "blog" : "product"}/${encodeURIComponent(id)}`;
  const name = isArticle ? record.title : record.name;
  const title = `${name} | Moris Clothing`;
  const description = String((isArticle ? record.excerpt || record.content : record.description) || `${name} from the Moris Clothing collection.`).replace(/\s+/g, " ").slice(0, 300);
  const image = imageUrl(record.image || "/preview.png");
  const canonical = `${SITE_URL}${path}`;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:type", isArticle ? "article" : "product");
  html = setMeta(html, "property", "og:site_name", "Moris Clothing");
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "og:image:alt", name);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", image);
  html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/i, "");
  html = html.replace("</head>", `  <link rel="canonical" href="${escapeHtml(canonical)}" />\n</head>`);
  const body = isArticle
    ? `<main class="shop-shell journal-article"><p class="eyebrow">THE MORIS JOURNAL</p><h1>${escapeHtml(record.title)}</h1>${record.image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(record.title)}" />` : ""}${record.excerpt ? `<p>${escapeHtml(record.excerpt)}</p>` : ""}<div>${String(record.content || "").split(/\n\s*\n/).map(part => `<p>${escapeHtml(part)}</p>`).join("")}</div></main>`
    : `<main class="shop-shell product-detail"><img class="product-detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(name)}" /><div><p class="eyebrow">${escapeHtml(record.category || "MORIS CLOTHING")}</p><h1>${escapeHtml(name)}</h1><p><strong>£${Number(record.price || 0).toFixed(2)}</strong></p><p>${escapeHtml(record.description || "A considered piece from Moris Clothing.")}</p></div></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

module.exports = { renderPreviewPage };
