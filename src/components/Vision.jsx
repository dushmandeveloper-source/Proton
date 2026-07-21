import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../i18n/LanguageContext.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function Vision() {
  const root = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(".vision__aims li", {
        x: -26,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".vision__aims", start: "top 88%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="vision" id="vision" ref={root}>
      <div className="container">
        <div className="vision__head" data-reveal>
          <p className="eyebrow">{t.vision.eyebrow}</p>
          <h2 className="display vision__title">{t.vision.title}</h2>
        </div>

        <div className="vision__grid">
          <article className="vcard vcard--dark" data-reveal>
            <span className="vcard__ring" aria-hidden="true" />
            <p className="eyebrow eyebrow--light">{t.vision.visionLabel}</p>
            <h3>{t.vision.visionHeading}</h3>
            <p>{t.vision.visionBody}</p>
            <div className="vcard__foot" aria-hidden="true">
              <span className="vcard__dots">
                <i style={{ background: "#3b82f6" }} />
                <i style={{ background: "#2dd4bf" }} />
                <i style={{ background: "#f0b23e" }} />
                <i style={{ background: "#4cc3e8" }} />
              </span>
              {t.vision.visionFoot}
            </div>
          </article>

          <article className="vcard vcard--light" data-reveal>
            <p className="eyebrow">{t.vision.missionLabel}</p>
            <h3>{t.vision.missionHeading}</h3>
            <p>{t.vision.missionBody}</p>
            <p className="vcard__aim-label">{t.vision.aimLabel}</p>
            <ul className="vision__aims">
              {t.vision.aims.map((aim) => (
                <li key={aim}>{aim}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
