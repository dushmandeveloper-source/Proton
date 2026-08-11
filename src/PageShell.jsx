import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Atmosphere from "./components/Atmosphere.jsx";

gsap.registerPlugin(ScrollTrigger);

// Shared baseline experience for secondary pages (About, Contact, Service detail):
// Lenis smooth scroll + reveal-on-scroll for [data-reveal] elements.
// Deliberately simpler than App.jsx: no pinning, no accordion animation.
export default function PageShell({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    const reveals = rootRef.current
      ? rootRef.current.querySelectorAll("[data-reveal]")
      : [];

    const ctx = gsap.context(() => {
      reveals.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    }, rootRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="app-shell">
      <Atmosphere />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
