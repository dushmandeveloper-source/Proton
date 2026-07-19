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
    // mobile: no pin — panels now hold a fixed height whether open or
    // closed (see index.css), so opening one never reflows the page and
    // the trigger math below never drifts out of sync with real layout.
    // Each panel is its own trigger — that only works now because a
    // fixed ~600px-tall box gives a real dwell window; the old accordion
    // was ~80px closed, leaving almost no scroll room before the next
    // one's trigger fired. The active panel is also auto-scrolled to
    // center so it always reads as "in focus" rather than drifting past.
    mm.add("(max-width: 900px)", () => {
      const panels = gsap.utils.toArray(section.current.querySelectorAll(".panel"));
      const triggers = panels.map((panel, i) =>
        ScrollTrigger.create({
          trigger: panel,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => show(i),
          onEnterBack: () => show(i),
        })
      );
      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, []);

  // center the newly-opened panel in the viewport on mobile — panels no
  // longer reflow the page on open, so this is the only thing keeping
  // the active card "in focus" as the user scrolls past its dwell zone
  useEffect(() => {
    if (window.innerWidth > 900) return;
    const panel = section.current?.querySelectorAll(".panel")[open];
    if (!panel) return;
    const id = requestAnimationFrame(() => {
      const r = panel.getBoundingClientRect();
      const targetY = window.scrollY + r.top - (window.innerHeight - r.height) / 2;
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { duration: 0.7, easing: (t) => 1 - Math.pow(1 - t, 3) });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(id);
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
