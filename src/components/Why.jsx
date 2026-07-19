import { useEffect, useRef, useState } from "react";

const REASONS = [
  {
    title: "Sri Lankan Licensed Company",
    desc: "Providing reliable local support and professional services.",
  },
  {
    title: "Strong China Resource Network",
    desc: "Connected with universities, hospitals, industries, and organizations.",
  },
  {
    title: "One-Stop Cross-Border Solutions",
    desc: "From consultation to completion.",
  },
  {
    title: "Long-Term Partnership Approach",
    desc: "Creating sustainable relationships between Sri Lanka and China.",
  },
];

export default function Why() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => {
      if (!paused.current) setActive((i) => (i + 1) % REASONS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="why" id="why">
      <div className="container">
        <div className="why__head" data-reveal>
          <p className="eyebrow">Why Choose Proton?</p>
          <h2 className="display why__title">Trusted. Professional. Connected.</h2>
        </div>
        <div className="why__grid">
          {REASONS.map((r, i) => (
            <div
              className={`why__cell ${active === i ? "is-active" : ""}`}
              key={r.title}
              data-reveal
              onMouseEnter={() => {
                paused.current = true;
                setActive(i);
              }}
              onMouseLeave={() => {
                paused.current = false;
              }}
            >
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
