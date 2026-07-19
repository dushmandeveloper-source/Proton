import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Vision() {
  const root = useRef(null);

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
          <p className="eyebrow">Vision &amp; Mission</p>
          <h2 className="display vision__title">What we stand for.</h2>
        </div>

        <div className="vision__grid">
          <article className="vcard vcard--dark" data-reveal>
            <span className="vcard__ring" aria-hidden="true" />
            <p className="eyebrow eyebrow--light">Our Vision</p>
            <h3>The leading Sino–Lanka strategic cooperation platform.</h3>
            <p>
              To become the leading Sino–Lanka strategic cooperation platform, empowering
              individuals and organizations through trusted global opportunities, innovation, and
              sustainable partnerships.
            </p>
            <div className="vcard__foot" aria-hidden="true">
              <span className="vcard__dots">
                <i style={{ background: "#3b82f6" }} />
                <i style={{ background: "#2dd4bf" }} />
                <i style={{ background: "#f0b23e" }} />
                <i style={{ background: "#4cc3e8" }} />
              </span>
              Education · Healthcare · Business · Industrial
            </div>
          </article>

          <article className="vcard vcard--light" data-reveal>
            <p className="eyebrow">Our Mission</p>
            <h3>A reliable bridge between Sri Lanka and China.</h3>
            <p>
              To create a reliable bridge between Sri Lanka and China by connecting people,
              businesses, and institutions with professional, transparent, and legally compliant
              services.
            </p>
            <p className="vcard__aim-label">We aim to achieve:</p>
            <ul className="vision__aims">
              <li>Resource sharing between two nations</li>
              <li>Sustainable international cooperation</li>
              <li>Professional cross-border solutions</li>
              <li>Mutual growth and success</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
