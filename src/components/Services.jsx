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
    // mobile: no pin — plain accordion in normal document flow. Cards
    // stay compact (a few rem tall) whether open or closed except the
    // active one, which expands; opening only shifts the cards below
    // it by that one height difference, not a full-page reflow, so a
    // small corrective nudge (below) is enough to keep it in view —
    // no need to fight the page back into a fixed position.
    mm.add("(max-width: 900px)", () => {
      const panels = gsap.utils.toArray(section.current.querySelectorAll(".panel"));
      const triggers = panels.map((panel, i) =>
        ScrollTrigger.create({
          trigger: panel,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => show(i),
          onEnterBack: () => show(i),
        })
      );
      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, []);

  // nudge the newly-opened panel back into a comfortable read position
  // if expanding it pushed its top edge close to (or under) the fixed
  // nav — a small corrective scroll, not a hard re-center, since the
  // layout only shifted by one card's height, not the whole page
  useEffect(() => {
    if (window.innerWidth > 900) return;
    const panel = section.current?.querySelectorAll(".panel")[open];
    if (!panel) return;
    const id = setTimeout(() => {
      const r = panel.getBoundingClientRect();
      const NAV_CLEARANCE = 88;
      if (r.top < NAV_CLEARANCE) {
        const targetY = window.scrollY + r.top - NAV_CLEARANCE - 12;
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, { duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }
    }, 350);
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
