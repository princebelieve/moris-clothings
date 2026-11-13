import previewShared from "./previewShared.cjs";
const { renderPreviewPage } = previewShared;

export default async function preview(request, response) {
  const { type, id } = request.query;
  const apiUrl = (process.env.VITE_API_URL || "https://moris-clothings.onrender.com").replace(/\/$/, "");
  if (!apiUrl || !["product", "blog"].includes(type) || !id) return response.status(500).type("text/plain").send("Moris page previews are not configured.");
  try {
    const path = type === "blog" ? "/api/blog/" : "/api/products/";
    const result = await fetch(`${apiUrl}${path}${encodeURIComponent(id)}`);
    if (!result.ok) return response.status(result.status === 404 ? 404 : 502).type("text/plain").send("This page is unavailable.");
    if (!(result.headers.get("content-type") || "").toLowerCase().includes("application/json")) throw new Error("The product service returned a non-JSON response.");
    const record = await result.json();
    const siteUrl = (process.env.SITE_URL || "https://morisclothing.co.uk").replace(/\/$/, "");
    const shell = await fetch(`${siteUrl}/index.html`);
    if (!shell.ok) throw new Error("Could not load the Moris site shell.");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    response.status(200).send(renderPreviewPage(await shell.text(), { type, id, record }));
  } catch (error) {
    console.error("Could not render Moris page preview", error);
    response.status(502).type("text/plain").send("Could not load this page preview.");
  }
}
