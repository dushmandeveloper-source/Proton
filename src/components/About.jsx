import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "../data/services.js";

gsap.registerPlugin(ScrollTrigger);

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function About() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      // credential card pops in after the image reveals
      gsap.from(".about__badge-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".about__visual", start: "top 70%" },
      });
      // slow parallax inside the arch
      gsap.to(".about__frame img", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: ".about__visual", start: "top bottom", end: "bottom top", scrub: true },
      });
      // smooth zoom-in once the image scrolls into view, holds while visible
      ScrollTrigger.create({
        trigger: ".about__visual",
        start: "top 75%",
        end: "bottom 25%",
        onEnter: () => document.querySelector(".about__visual").classList.add("is-inview"),
        onLeave: () => document.querySelector(".about__visual").classList.remove("is-inview"),
        onEnterBack: () => document.querySelector(".about__visual").classList.add("is-inview"),
        onLeaveBack: () => document.querySelector(".about__visual").classList.remove("is-inview"),
      });
      gsap.from(".about__chips .chip", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about__chips", start: "top 90%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={root}>
      <div className="container about__grid">
        <div className="about__visual" data-reveal>
          <div className="about__frame">
            <img
              src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=1200&auto=format&fit=crop"
              alt="Partners reviewing an agreement in a modern office"
              loading="lazy"
            />
          </div>
          <div className="about__badge-card">
            <div>
              <b><Check /> Licensed</b>
              <span>Sri Lankan Entity</span>
            </div>
            <div>
              <b><Check /> Verified</b>
              <span>China Network</span>
            </div>
          </div>
        </div>

        <div data-reveal>
          <p className="eyebrow">About Proton</p>
          <h2 className="display about__title">Your trusted gateway between Sri Lanka &amp; China.</h2>
          <p>
            China offers world-class opportunities in education, healthcare, technology,
            manufacturing, and business development.
          </p>
          <p>
            However, accessing these opportunities requires proper guidance, trusted connections,
            and professional support.
          </p>
          <p>
            PROTON SERVICES PLATFORM provides a complete solution by combining Sri Lankan market
            understanding with strong Chinese institutional resources.
          </p>
          <div className="about__chips">
            {services.map((s) => (
              <span key={s.num} className="chip" style={{ "--chip-accent": s.accent }}>
                <i aria-hidden="true" /> {s.short}
              </span>
            ))}
            <span className="chip" style={{ "--chip-accent": "#1d4ed8" }}>
              <i aria-hidden="true" /> End-to-End Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
