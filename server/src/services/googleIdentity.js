const crypto = require("crypto");

let cachedKeys = [];
let expiresAt = 0;

async function getKeys() {
  if (cachedKeys.length && Date.now() < expiresAt) return cachedKeys;
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok) throw new Error("Google signing keys are unavailable.");
  if (!(response.headers.get("content-type") || "").toLowerCase().includes("application/json")) throw new Error("Google signing keys returned an unexpected response.");
  const data = await response.json();
  const maxAge = Number(response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1]) || 300;
  cachedKeys = data.keys || [];
  expiresAt = Date.now() + maxAge * 1000;
  return cachedKeys;
}

async function verifyGoogleCredential(token, audience) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid Google credential.");
  const [headerPart, claimsPart, signaturePart] = parts;
  const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
  const claims = JSON.parse(Buffer.from(claimsPart, "base64url").toString("utf8"));
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Google credential.");
  let keys = await getKeys();
  let jwk = keys.find(key => key.kid === header.kid && key.alg === "RS256");
  if (!jwk) { cachedKeys = []; expiresAt = 0; keys = await getKeys(); jwk = keys.find(key => key.kid === header.kid && key.alg === "RS256"); }
  if (!jwk) throw new Error("Unknown Google signing key.");
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const validSignature = crypto.verify("RSA-SHA256", Buffer.from(`${headerPart}.${claimsPart}`), publicKey, Buffer.from(signaturePart, "base64url"));
  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const validIssuer = ["accounts.google.com", "https://accounts.google.com"].includes(claims.iss);
  if (!validSignature || !validIssuer || !audiences.includes(audience) || !claims.exp || claims.exp <= now || (claims.iat && claims.iat > now + 300)) throw new Error("Google credential verification failed.");
  return claims;
}

module.exports = { verifyGoogleCredential };
