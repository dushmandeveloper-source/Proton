// Talks to the Proton_Admin backend's public course endpoints
// (Web_Backend/Controllers/Api/CoursesApiController.cs). Mirrors
// universitiesApi.js exactly — same base URL, same image-URL resolution.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5080";

export { resolveImageUrl } from "./universitiesApi.js";

export async function fetchCourses({ courseType = "" } = {}) {
  const params = new URLSearchParams();
  if (courseType) params.set("courseType", courseType);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/courses${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`Failed to load courses (${res.status})`);
  return res.json();
}

export async function fetchCourse(id) {
  const res = await fetch(`${API_BASE}/api/courses/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to load course ${id} (${res.status})`);
  return res.json();
}
