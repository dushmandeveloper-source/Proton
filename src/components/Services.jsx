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
  // desktop: exclusive — `open` is the single active index, driven by
  // the pinned scroll story. mobile: additive — `openMobile` is a set
  // of every card the user has scrolled to (or tapped); once opened a
  // card stays open until the user explicitly closes it, it never
  // auto-closes just because scrolling moved on to the next one.
  const [open, setOpen] = useState(0);
  const [openMobile, setOpenMobile] = useState(() => new Set([0]));
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  const section = useRef(null);
  const openRef = useRef(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const show = (i) => {
    if (openRef.current !== i) {
      openRef.current = i;
      setOpen(i);
    }
  };

  const showMobile = (i) => {
    setOpenMobile((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  };

  const toggleMobile = (i) => {
    setOpenMobile((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
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
    // mobile: no pin — plain accordion in normal document flow. A card
    // opens the instant its collapsed top edge crosses the middle of
    // the screen and then STAYS open — scrolling on to the next card
    // only adds it to the open set, it never closes a previous one.
    // Only the user tapping a card's own close control removes it.
    // Each trigger kills itself the moment it fires once: closing a
    // card shrinks it, which shifts where its edges sit relative to
    // the 50% line and can make an unkilled trigger re-fire on the
    // very next scroll recalculation, instantly re-opening a card the
    // user just closed.
    mm.add("(max-width: 900px)", () => {
      const panels = gsap.utils.toArray(section.current.querySelectorAll(".panel"));
      const triggers = panels.map((panel, i) => {
        const st = ScrollTrigger.create({
          trigger: panel,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => { showMobile(i); st.kill(); },
          onEnterBack: () => { showMobile(i); st.kill(); },
        });
        return st;
      });
      return () => triggers.forEach((t) => t.kill());
    });
    return () => mm.revert();
  }, []);

  // center the most-recently-opened panel in the viewport — every
  // time, both scrolling down and up. The accordion's expand reflows
  // the page (an open card is much taller than a collapsed one), so
  // without this the card that just opened can end up mostly above or
  // below the visible area instead of fully readable in the middle.
  // Waiting for the CSS grid-row transition (0.6s) to finish before
  // measuring keeps this from re-centering against a still-animating,
  // not-yet-final layout.
  const lastOpenedMobile = useRef(0);
  useEffect(() => {
    if (window.innerWidth > 900) return;
    // find whichever index just got added (the set only ever grows
    // from a scroll trigger, so the "new" one is whatever isn't the
    // previously-tracked last-opened index)
    let target = lastOpenedMobile.current;
    for (const i of openMobile) {
      if (i !== lastOpenedMobile.current) target = i;
    }
    lastOpenedMobile.current = target;
    const r = section.current?.getBoundingClientRect();
    // page load lands on the hero; Services sits far below the fold
    // and hasn't been scrolled to yet, so there's nothing here to
    // "center" — only re-center once the section is actually at least
    // partly on screen, i.e. this is a real scroll-driven open
    if (!r || r.top > window.innerHeight || r.bottom < 0) return;
    const panel = section.current?.querySelectorAll(".panel")[target];
    if (!panel) return;
    const id = setTimeout(() => {
      // the grid-row expand transition (0.6s) has settled by now —
      // refresh so every panel's trigger start/end reflects the new
      // layout before we measure and scroll against it
      ScrollTrigger.refresh();
      const r = panel.getBoundingClientRect();
      const targetY = window.scrollY + r.top - Math.max(16, (window.innerHeight - r.height) / 2);
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }, 650);
    return () => clearTimeout(id);
  }, [openMobile]);

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
            const isOpen = isMobile ? openMobile.has(i) : open === i;
            const handleClick = () => (isMobile ? toggleMobile(i) : show(i));
            return (
              <button
                key={s.num}
                type="button"
                className={`panel ${isOpen ? "is-open" : ""}`}
                style={{ "--accent": s.accent }}
                onClick={handleClick}
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
