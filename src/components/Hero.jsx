import { useEffect, useRef } from "react";
import gsap from "gsap";
import { services } from "../data/services.js";

const Arrow = () => (
  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// fan slots, back (0) to front (3) — cards rotate through these as the
// flight dot completes each Colombo → Beijing run
const SLOTS = [
  { x: 108, y: -14, r: 13 },
  { x: 52, y: 14, r: 6 },
  { x: -12, y: -8, r: -2 },
  { x: -76, y: 8, r: -11 },
];
const DECK = [services[3], services[2], services[1], services[0]];

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".deck__card");

      // all card positioning lives in GSAP — mixing inline CSS transforms
      // with tweens loses the -50% centering
      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: SLOTS[i].x,
          y: SLOTS[i].y,
          rotation: SLOTS[i].r,
          zIndex: i + 1,
        });
      });
      if (reduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero__eyebrow", { y: 24, opacity: 0, duration: 0.9 }, 0.15)
        .from(".hero__title .split-line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.25)
        .from(".hero__lede, .hero__note", { y: 30, opacity: 0, duration: 1, stagger: 0.12 }, 0.7)
        .from(".hero__actions > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.95)
        .from(
          ".deck__card",
          // on mobile the deck sits close under the note text — a bounce
          // overshoot briefly grows cards past their final size and pokes
          // into the copy above, so skip the bounce there
          isMobile
            ? { opacity: 0, scale: 0.85, duration: 0.8, stagger: 0.12, ease: "power3.out" }
            : { opacity: 0, scale: 0.6, duration: 1, stagger: 0.12, ease: "back.out(1.4)" },
          0.5
        )
        .from(".deck__route", { y: 20, opacity: 0, duration: 0.8 }, 1.3);

      // deck shuffle — every completed Colombo → Beijing flight brings the
      // next card to the front; the front card lifts out and slides to the back
      const slotOf = cards.map((_, i) => i);
      const cycle = () => {
        cards.forEach((card, i) => {
          const next = (slotOf[i] + 1) % SLOTS.length;
          const wasFront = slotOf[i] === SLOTS.length - 1;
          slotOf[i] = next;
          const s = SLOTS[next];
          if (wasFront) {
            gsap.timeline()
              .to(card, { y: "-=150", rotation: "+=8", scale: 0.94, duration: 0.4, ease: "power2.in" })
              .set(card, { zIndex: 1 })
              .to(card, { x: s.x, y: s.y, rotation: s.r, scale: 1, duration: 0.55, ease: "power3.out" });
          } else {
            gsap.set(card, { zIndex: next + 1 });
            gsap.to(card, { x: s.x, y: s.y, rotation: s.r, duration: 0.9, ease: "power3.inOut" });
          }
        });
      };

      // flight — Sri Lanka to China, then back again; the deck advances
      // once per completed round trip (when the plane lands back home).
      // An explicit two-leg timeline (rather than yoyo) keeps "which way
      // is it facing" and "did we just land" unambiguous.
      const dot = ".deck__route .dot-fly";
      const plane = document.querySelector(`${dot} svg`);
      gsap.set(plane, { rotate: 90, transformOrigin: "50% 50%" });

      const flight = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      flight
        .set(dot, { left: "0%" })
        .set(plane, { rotate: 90 })
        .to(dot, { left: "100%", duration: 2.6, ease: "power1.inOut" })
        .to({}, { duration: 0.5 }) // pause at China
        .set(plane, { rotate: -90 })
        .to(dot, { left: "0%", duration: 2.6, ease: "power1.inOut" })
        .call(cycle);

      // gentle breathing on the whole stage (parent — never fights card tweens)
      gsap.to(".deck__stage", { y: -8, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // gentle parallax drift on the deck while scrolling away
      gsap.to(".deck", {
        y: 70,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="top" ref={root}>
      <div className="container hero__grid">
        <div className="hero__intro">
          <p className="eyebrow hero__eyebrow">Sino–Lanka Strategic Cooperation Platform</p>
          <h1 className="display hero__title">
            <span className="split-line"><span>Connecting Sri Lanka</span></span>
            <span className="split-line"><span><em className="amp">&</em> China through</span></span>
            <span className="split-line"><span><span className="accent">trusted solutions.</span></span></span>
          </h1>
          <p className="lede hero__lede">
            A professional Sino–Lanka cooperation platform providing legal, compliant, and reliable
            cross-border services in education, healthcare, business, and industrial development.
          </p>
          <p className="hero__note">
            PROTON SERVICES PLATFORM is operated by a Sri Lankan licensed company, connecting
            individuals, enterprises, and organizations with China's world-class resources including
            universities, hospitals, industrial parks, technology providers, and business networks.
          </p>
        </div>

        <div className="hero__actions">
          <a href="#services" className="btn btn--ink"><span>Explore Services <Arrow /></span></a>
          <a href="#about" className="btn btn--ghost"><span>About the Platform</span></a>
        </div>

        <div className="deck" aria-hidden="true">
          <div className="deck__stage">
            {DECK.map((s) => (
              <div key={s.num} className="deck__card" style={{ "--card-accent": s.accent }}>
                <img src={s.img} alt="" loading="eager" />
                <span className="deck__tag"><span className="dot" /> {s.num} {s.short}</span>
              </div>
            ))}
          </div>
          <div className="deck__route">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>SRI LANKA</span>
            <span className="line">
              <span className="dot-fly">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </span>
            </span>
            <span>CHINA</span>
          </div>
        </div>

        {/* stats row hidden for now — restore by uncommenting
        <div className="hero__stats">
          <div className="stat"><b>4</b><span>Service Platforms</span></div>
          <div className="stat"><b>Licensed</b><span>Sri Lankan Entity</span></div>
          <div className="stat"><b>Verified</b><span>China Network</span></div>
          <div className="stat"><b>End-to-End</b><span>Support</span></div>
        </div>
        */}
      </div>
    </section>
  );
}
