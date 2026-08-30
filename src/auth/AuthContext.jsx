import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../data/authApi.js";

// Mirrors i18n/LanguageContext.jsx's structure: a Context, a Provider that
// owns the state, and a hook that throws when used outside the provider.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .getCurrentUser()
      .then((current) => { if (!cancelled) setUser(current); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function login(email, password) {
    const result = await authApi.login(email, password);
    setUser(result);
    return result;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  // register-new also signs the visitor in (session cookie set server-side),
  // so treat its response the same way login's is treated.
  async function registerNew(payload) {
    const result = await authApi.registerNew(payload);
    setUser(result);
    return result;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerNew }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
