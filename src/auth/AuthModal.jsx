import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import * as authApi from "../data/authApi.js";

// Registration/login modal surfaced from a course page's "Register for this
// course" action when the visitor isn't signed in yet. Defaults to register
// mode since a first-time visitor without an account is the common case.
export default function AuthModal({ courseId, courseName, onClose, onSuccess }) {
  const auth = useAuth();
  const [mode, setMode] = useState("register");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  function updateRegisterField(field, value) {
    setRegisterForm((f) => ({ ...f, [field]: value }));
  }

  function updateLoginField(field, value) {
    setLoginForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await auth.registerNew({
        FirstName: registerForm.firstName,
        LastName: registerForm.lastName,
        Email: registerForm.email,
        Password: registerForm.password,
        Phone: registerForm.phone,
        CourseIDs: [courseId],
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await auth.login(loginForm.email, loginForm.password);
      // Logging in alone doesn't enroll in the course being viewed — do
      // that as a separate follow-up call, same as an already-logged-in
      // visitor clicking "Register" directly.
      await authApi.registerForCourse(courseId);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="auth-modal__overlay" onClick={handleOverlayClick}>
      <div className="auth-modal__card" role="dialog" aria-modal="true">
        <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h3 className="auth-modal__title">
          {mode === "register" ? "Create your account" : "Log in"}
        </h3>
        {courseName && (
          <p className="auth-modal__subtitle">to register for &ldquo;{courseName}&rdquo;</p>
        )}

        {error && <p className="auth-modal__error">{error}</p>}

        {mode === "register" ? (
          <form className="auth-modal__form" onSubmit={handleRegisterSubmit}>
            <div className="auth-modal__row">
              <div className="auth-modal__field">
                <label htmlFor="auth-first-name">First name</label>
                <input
                  id="auth-first-name"
                  type="text"
                  required
                  value={registerForm.firstName}
                  onChange={(e) => updateRegisterField("firstName", e.target.value)}
                />
              </div>
              <div className="auth-modal__field">
                <label htmlFor="auth-last-name">Last name</label>
                <input
                  id="auth-last-name"
                  type="text"
                  required
                  value={registerForm.lastName}
                  onChange={(e) => updateRegisterField("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="auth-modal__field">
              <label htmlFor="auth-register-email">Email</label>
              <input
                id="auth-register-email"
                type="email"
                required
                value={registerForm.email}
                onChange={(e) => updateRegisterField("email", e.target.value)}
              />
            </div>
            <div className="auth-modal__field">
              <label htmlFor="auth-register-password">Password</label>
              <input
                id="auth-register-password"
                type="password"
                required
                minLength={8}
                value={registerForm.password}
                onChange={(e) => updateRegisterField("password", e.target.value)}
              />
            </div>
            <div className="auth-modal__field">
              <label htmlFor="auth-phone">Phone (optional)</label>
              <input
                id="auth-phone"
                type="tel"
                value={registerForm.phone}
                onChange={(e) => updateRegisterField("phone", e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--ink auth-modal__submit" disabled={submitting}>
              <span>{submitting ? "Registering…" : "Register"}</span>
            </button>
          </form>
        ) : (
          <form className="auth-modal__form" onSubmit={handleLoginSubmit}>
            <div className="auth-modal__field">
              <label htmlFor="auth-login-email">Email</label>
              <input
                id="auth-login-email"
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => updateLoginField("email", e.target.value)}
              />
            </div>
            <div className="auth-modal__field">
              <label htmlFor="auth-login-password">Password</label>
              <input
                id="auth-login-password"
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => updateLoginField("password", e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--ink auth-modal__submit" disabled={submitting}>
              <span>{submitting ? "Logging in…" : "Log in"}</span>
            </button>
          </form>
        )}

        <p className="auth-modal__toggle">
          {mode === "register" ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(null); }}>
                Log in
              </button>
            </>
          ) : (
            <>
              Need an account?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(null); }}>
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
