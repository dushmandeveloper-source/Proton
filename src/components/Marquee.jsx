import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Marquee() {
  const root = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(".marquee__track", { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  const half = (
    <>
      {t.marquee.map((item) => (
        <span key={item}>
          <em>✦</em>
          {item}
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <div className="marquee__track">
        {half}
        {half}
      </div>
    </div>
  );
}
