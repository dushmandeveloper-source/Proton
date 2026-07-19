import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "../data/services.js";

gsap.registerPlugin(ScrollTrigger);

const Arrow = () => (
  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Services() {
  const [open, setOpen] = useState(0);
  const section = useRef(null);
  const openRef = useRef(0);

  const show = (i) => {
    if (openRef.current !== i) {
      openRef.current = i;
      setOpen(i);
    }
  };

  // Scroll story: the section pins and each platform opens in turn (01 → 04),
  // then the page releases to the next section.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "+=560%",
        pin: true,
        scrub: 1.4,
        anticipatePin: 1,
        onUpdate: (self) => show(Math.min(3, Math.floor(self.progress * 4))),
      });
      return () => st.kill();
    });
    // mobile: no pin — each card gets an equal, fixed-height dwell zone
    // measured from the panels list's own top. Triggering off each panel's
    // own box (its old approach) breaks down because a collapsed panel is
    // only ~80px tall — its 50%-to-50% window covers barely any scroll, so
    // panels 2-4 flew by in a couple of wheel ticks while panel 1 (which
    // happened to sit under a long stretch of scroll) got all the dwell time.
    mm.add("(max-width: 900px)", () => {
      const list = section.current.querySelector(".panels");
      const ZONE_VH = 0.9; // each platform gets ~0.9 viewport heights of scroll
      const triggers = services.map((_, i) =>
        ScrollTrigger.create({
          trigger: list,
          start: () => `top+=${i * ZONE_VH * window.innerHeight} 50%`,
          end: () => `top+=${(i + 1) * ZONE_VH * window.innerHeight} 50%`,
          onEnter: () => show(i),
          onEnterBack: () => show(i),
        })
      );
      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, []);

  // expanding a card changes page height on mobile once its grid-row
  // transition finishes (0.6s) — refresh only after that settles, or the
  // recalculated trigger positions are measured against a still-animating
  // layout and drift out of sync with the next scroll tick
  useEffect(() => {
    if (window.innerWidth > 900) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <section className="services" id="services" ref={section}>
      <div className="container">
        <div className="services__head">
          <div data-reveal>
            <p className="eyebrow">Our Four Service Platforms</p>
            <h2 className="display services__title">Choose your opportunity path.</h2>
          </div>
          <p className="lede services__intro" data-reveal>
            PROTON provides specialized solutions through four main service platforms.
          </p>
        </div>

        <div className="panels" data-reveal>
          {services.map((s, i) => {
            const isOpen = open === i;
            return (
              <button
                key={s.num}
                type="button"
                className={`panel ${isOpen ? "is-open" : ""}`}
                style={{ "--accent": s.accent }}
                onClick={() => show(i)}
                aria-expanded={isOpen}
              >
                <div className="panel__bg">
                  <img src={s.img} alt="" loading="lazy" />
                </div>

                <span className="panel__closed">
                  <span className="panel__num">{s.num}</span>
                  <span className="panel__vert">{s.short}</span>
                  <span className="panel__plus" aria-hidden="true">+</span>
                </span>

                <span className="panel__open">
                  <span className="panel__kicker">{s.num} — {s.kicker}</span>
                  <span className="panel__heading">{s.heading}</span>
                  <span className="panel__desc">{s.desc}</span>
                  <ul className="panel__list">
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <span className="panel-cta">{s.cta} <Arrow /></span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="services__progress" aria-hidden="true">
          {services.map((s, i) => (
            <span key={s.num} className={open === i ? "is-active" : ""} style={{ "--accent": s.accent }} />
          ))}
        </div>
      </div>
    </section>
  );
}
