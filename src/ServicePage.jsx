import PageShell from "./PageShell.jsx";
import { services } from "./data/services.js";
import { useLanguage } from "./i18n/LanguageContext.jsx";

const Arrow = () => (
  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Full detail page for a single service platform, parametrized by key
// ("education" | "healthcare" | "business" | "industrial"). Copy comes
// from servicesTranslations in data/services.js, same source the home
// page accordion uses, so the two never drift apart.
export default function ServicePage({ serviceKey }) {
  const { serviceCopy } = useLanguage();
  const meta = services.find((s) => s.key === serviceKey);
  const copy = serviceCopy[serviceKey];

  return (
    <PageShell>
      <main className="page-main service-page">
        <section className="service-hero" style={{ "--accent": meta.accent }}>
          <div className="container service-hero__grid">
            <div data-reveal>
              <p className="eyebrow">{meta.num} — {copy.kicker}</p>
              <h1 className="display service-hero__title">{copy.heading}</h1>
              <p className="lede service-hero__desc">{copy.desc}</p>
            </div>
            <div className="service-hero__visual" data-reveal>
              <img src={meta.img} alt="" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="service-details">
          <div className="container">
            <div className="service-details__grid">
              <div data-reveal>
                <h2 className="display service-details__title">What's included</h2>
                <ul className="service-details__list">
                  {copy.items.map((item) => (
                    <li key={item}>
                      <Check /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="service-details__cta-card" data-reveal style={{ "--accent": meta.accent }}>
                <p className="eyebrow">Ready to get started?</p>
                <p>Reach out to our team and we'll guide you through every step.</p>
                <a href="/contact.html" className="btn btn--ink">
                  <span>{copy.cta} <Arrow /></span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
