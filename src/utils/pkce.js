// Generate random PKCE verifier
export function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ("0" + dec.toString(16)).substr(-2)).join("");
}

// Generate PKCE challenge (SHA256 -> base64url)
export async function pkceChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
