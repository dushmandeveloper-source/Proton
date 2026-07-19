import { useEffect, useRef } from "react";
import gsap from "gsap";

const ITEMS = ["Sino–Lanka Cooperation", "Education", "Healthcare", "Business Solutions", "Industrial Tech"];

export default function Marquee() {
  const root = useRef(null);

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
      {ITEMS.map((t) => (
        <span key={t}>
          <em>✦</em>
          {t}
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
