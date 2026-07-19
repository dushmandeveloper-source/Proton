import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand">
          <i aria-hidden="true" />
          PROTON
          <small>SERVICES PLATFORM</small>
        </a>
        <div className="nav__links">
          <a href="#services">Services</a>
          <a href="#vision">Vision</a>
          <a href="#about">About</a>
          <a href="#why">Why Proton</a>
          <a href="#contact" className="btn btn--ink nav__cta"><span>Contact Us</span></a>
        </div>
      </div>
    </nav>
  );
}
