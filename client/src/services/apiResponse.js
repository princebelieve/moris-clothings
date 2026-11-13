export async function readApiJson(response, fallback = "The store service returned an unexpected response. Please try again shortly.") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${fallback} (HTTP ${response.status})`);
  }
  return response.json();
}
