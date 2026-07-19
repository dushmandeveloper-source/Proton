import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Fixed background layer behind every light section: soft drifting color
 * blooms in the four service colors, plus a fine grain texture for depth.
 * Sits once at the page root — sections scroll over it, it never reflows.
 */
export default function Atmosphere() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".atmo__bloom").forEach((el, i) => {
        gsap.to(el, {
          x: i % 2 ? -40 : 50,
          y: i % 2 ? 40 : -30,
          duration: 16 + i * 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="atmo" ref={root} aria-hidden="true">
      <span className="atmo__bloom atmo__bloom--edu" />
      <span className="atmo__bloom atmo__bloom--med" />
      <span className="atmo__bloom atmo__bloom--biz" />
      <span className="atmo__bloom atmo__bloom--ind" />
      <span className="atmo__grain" />
    </div>
  );
}
