// Talks to the Proton_Admin backend's public auth + enrollment endpoints
// (Web_Backend/Controllers/Api/AuthApiController.cs and
// Controllers/Api/EnrollmentsApiController.cs). Mirrors coursesApi.js's
// style — same base URL convention, same throw-on-non-ok pattern — but
// every call here needs credentials: "include" since these endpoints rely
// on the session cookie (HttpOnly) set by ASP.NET, and the backend runs on
// a different origin than this dev server.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5080";

async function parseErrorMessage(res, fallback) {
  try {
    const body = await res.json();
    if (body && body.message) return body.message;
  } catch {
    // Response body wasn't JSON (or was empty) — fall through to default.
  }
  return fallback;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Login failed (${res.status})`));
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Logout failed (${res.status})`));
  }
  return res.json().catch(() => null);
}

// Special-cased: a 401 here just means "not logged in", which is the normal
// state for a first-time visitor — not an error worth throwing over.
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Failed to load current user (${res.status})`));
  }
  return res.json();
}

// `payload` should NOT include a `Password` field — the backend
// auto-generates one and emails it to the new student, so the public
// registration form no longer collects one.
export async function registerNew(payload) {
  const res = await fetch(`${API_BASE}/api/enrollments/register-new`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Registration failed (${res.status})`));
  }
  return res.json();
}

// `payment` is optional — { method: "Cash"|"BankDeposit", amount, notes } —
// left undefined/blank when the visitor skips the payment step. Unlike
// register-new (which may enroll several courses in one submission and so
// restricts any declared payment to the first), this is always exactly one
// course per call, so the payment applies to it directly.
export async function registerForCourse(courseId, scheduleId = "", payment = null) {
  const res = await fetch(`${API_BASE}/api/enrollments/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      CourseID: courseId,
      ScheduleID: scheduleId,
      PaymentMethod: payment?.method || "",
      InitialPaymentAmount: payment?.amount || 0,
      PaymentNotes: payment?.notes || "",
    }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Course registration failed (${res.status})`));
  }
  return res.json();
}

// Follow-up call to attach a bank-deposit slip file to a registration just
// created by registerNew() or registerForCourse() — those are both JSON
// endpoints and can't carry a multipart file directly, so the slip (if any)
// is uploaded in this separate step right after. The backend verifies the
// registration belongs to the now-logged-in caller before accepting it.
export async function submitRegistrationPayment(registrationId, { method, amount, notes, slipFile } = {}) {
  const form = new FormData();
  form.set("PaymentMethod", method || "");
  form.set("Amount", String(amount || 0));
  form.set("Notes", notes || "");
  if (slipFile) form.set("PaymentSlip", slipFile);

  const res = await fetch(`${API_BASE}/api/enrollments/${encodeURIComponent(registrationId)}/payment`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Recording payment failed (${res.status})`));
  }
  return res.json();
}

export async function getMyRegistrations() {
  const res = await fetch(`${API_BASE}/api/enrollments/my`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, `Failed to load your registrations (${res.status})`));
  }
  return res.json();
}
