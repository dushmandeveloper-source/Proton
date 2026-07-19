import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Atmosphere from "./components/Atmosphere.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Services from "./components/Services.jsx";
import Vision from "./components/Vision.jsx";
import About from "./components/About.jsx";
import Why from "./components/Why.jsx";
import Footer from "./components/Footer.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // generic scroll reveals for anything tagged data-reveal
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: reduced ? 0 : 48,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });
    });

    return () => {
      ctx.revert();
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <>
      <Atmosphere />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Vision />
        <About />
        <Why />
      </main>
      <Footer />
    </>
  );
}
