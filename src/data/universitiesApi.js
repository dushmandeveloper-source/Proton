// Talks to the Proton_Admin backend's public university endpoints
// (Web_Backend/Controllers/Api/UniversitiesApiController.cs). The backend
// runs on a separate origin from this dev server, hence an absolute base
// URL and the CORS policy configured on that side for this origin.
//
// Set VITE_API_BASE_URL in a .env file (see .env.example) to point this at
// a different backend — e.g. the production API host once deployed —
// without touching this file. Vite only exposes env vars prefixed VITE_
// to client code, and only reads them at build time.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5080";

// Logo/cover/gallery URLs from the API are web-relative paths under the
// backend's own wwwroot (e.g. "/Uploads/Universities/xyz.jpg") — they need
// the same API_BASE prefix as the JSON requests, or the browser resolves
// them against this frontend's origin instead and the image 404s.
export function resolveImageUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // already absolute
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function fetchUniversities() {
  const res = await fetch(`${API_BASE}/api/universities`);
  if (!res.ok) throw new Error(`Failed to load universities (${res.status})`);
  return res.json();
}

export async function fetchUniversity(id) {
  const res = await fetch(`${API_BASE}/api/universities/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to load university ${id} (${res.status})`);
  return res.json();
}
