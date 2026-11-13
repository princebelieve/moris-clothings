const SITE_URL = (process.env.SITE_URL || "https://morisclothing.co.uk").replace(/\/$/, "");
const escapeXml = value => String(value).replace(/[<>&'\"]/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[char]));
const staticPaths = ["/", "/collection", "/about", "/contact", "/faq", "/blog", "/terms", "/privacy", "/shipping", "/returns-refunds", "/disclaimer"];
export default async function sitemap(_request, response) {
  const apiUrl = (process.env.VITE_API_URL || "").replace(/\/$/, "");
  let products = []; let posts = [];
  if (apiUrl) {
    try {
      const [productResponse, postResponse] = await Promise.all([fetch(`${apiUrl}/api/products`), fetch(`${apiUrl}/api/blog`)]);
      if (productResponse.ok && (productResponse.headers.get("content-type") || "").toLowerCase().includes("application/json")) products = await productResponse.json();
      if (postResponse.ok && (postResponse.headers.get("content-type") || "").toLowerCase().includes("application/json")) posts = await postResponse.json();
    }
    catch (error) { console.error("Could not fetch Moris sitemap records", error); }
  }
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
  const urls = [...staticPaths.map(path => ({ loc: `${SITE_URL}${path}` })), ...categories.map(category => ({ loc: `${SITE_URL}/category/${encodeURIComponent(category)}` })), ...products.map(product => ({ loc: `${SITE_URL}/product/${encodeURIComponent(product._id || product.id)}`, updatedAt: product.updatedAt })), ...posts.map(post => ({ loc: `${SITE_URL}/blog/${encodeURIComponent(post._id)}`, updatedAt: post.updatedAt }))];
  const xml = urls.map(({ loc, updatedAt }) => `  <url><loc>${escapeXml(loc)}</loc>${updatedAt ? `<lastmod>${new Date(updatedAt).toISOString().slice(0, 10)}</lastmod>` : ""}</url>`).join("\n");
  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>`);
}
