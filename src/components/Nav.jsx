import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { services, servicesTranslations } from "../data/services.js";
import { useAuth } from "../auth/AuthContext.jsx";

function LanguageSwitcher() {
  const { lang, setLang, languages } = useLanguage();
  const [openMenu, setOpenMenu] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === lang);

  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openMenu]);

  return (
    <div className="lang-switch" ref={ref}>
      <button
        type="button"
        className="lang-switch__trigger"
        onClick={() => setOpenMenu((v) => !v)}
        aria-expanded={openMenu}
        aria-label="Change language"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
        </svg>
        {current?.short}
      </button>
      {openMenu && (
        <div className="lang-switch__menu" role="menu">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              className={l.code === lang ? "is-active" : ""}
              onClick={() => {
                setLang(l.code);
                setOpenMenu(false);
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t, lang } = useLanguage();
  const copy = servicesTranslations[lang];

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  return (
    <div className="nav__dropdown" ref={ref}>
      <button
        type="button"
        className="nav__dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {t.nav.services}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="nav__dropdown-menu" role="menu">
          {services.map((s) => (
            <a
              key={s.key}
              href={`/services/${s.key}.html`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {copy[s.key].short}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthControl() {
  const auth = useAuth();

  // Avoid a flash of "logged out" state while the /api/auth/me check is
  // still in flight — render nothing extra until we actually know.
  if (auth.loading) return null;

  if (auth.user) {
    const firstName = (auth.user.fullName || "").split(" ")[0] || auth.user.fullName;
    async function handleLogout() {
      try {
        await auth.logout();
      } finally {
        // Simplest way to reset all page state across this router-less,
        // multi-entry-point app — every page re-checks auth on load.
        window.location.href = "/";
      }
    }
    return (
      <div className="nav__auth">
        <span className="nav__auth-name">Hi, {firstName}</span>
        <button type="button" className="nav__auth-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <a href="/services/register.html?mode=login" className="nav__auth-login">
      Log in
    </a>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="container nav__inner">
        <a href="/" className="nav__brand">
          <img src="/poton.png" alt="PROTON Services Platform" className="nav__logo" />
        </a>
        <div className="nav__links">
          <a href="/">{t.nav.home}</a>
          <a href="/about.html">{t.nav.about}</a>
          <ServicesDropdown />
          <LanguageSwitcher />
          <AuthControl />
          <a href="/contact.html" className="btn btn--ink nav__cta"><span>{t.nav.contact}</span></a>
        </div>
      </div>
    </nav>
  );
}
