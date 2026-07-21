import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Why() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => {
      if (!paused.current) setActive((i) => (i + 1) % t.why.reasons.length);
    }, 2000);
    return () => clearInterval(id);
  }, [t]);

  return (
    <section className="why" id="why">
      <div className="container">
        <div className="why__head" data-reveal>
          <p className="eyebrow">{t.why.eyebrow}</p>
          <h2 className="display why__title">{t.why.title}</h2>
        </div>
        <div className="why__grid">
          {t.why.reasons.map((r, i) => (
            <div
              className={`why__cell ${active === i ? "is-active" : ""}`}
              key={r.title}
              data-reveal
              onMouseEnter={() => {
                paused.current = true;
                setActive(i);
              }}
              onMouseLeave={() => {
                paused.current = false;
              }}
            >
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
