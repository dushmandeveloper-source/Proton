import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

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
        <a href="#top" className="nav__brand">
          <i aria-hidden="true" />
          PROTON
          <small>SERVICES PLATFORM</small>
        </a>
        <div className="nav__links">
          <a href="#services">{t.nav.services}</a>
          <a href="#vision">{t.nav.vision}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#why">{t.nav.why}</a>
          <LanguageSwitcher />
          <a href="#contact" className="btn btn--ink nav__cta"><span>{t.nav.contact}</span></a>
        </div>
      </div>
    </nav>
  );
}
