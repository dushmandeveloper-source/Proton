import PageShell from "./PageShell.jsx";
import { services } from "./data/services.js";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import UniversitiesSection from "./components/UniversitiesSection.jsx";

const Arrow = () => (
  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Richer, education-specific layout matching the reference design the user
// supplied — glass-morphism hero stat badge, gradient-blob atmosphere,
// checklist grid with a glowing CTA card, and the live UniversitiesSection
// (map + cards). Healthcare/Business/Industrial stay on the plainer
// ServicePage template; this one page earns the extra visual weight because
// it's the one with real backing data (the university directory).
export default function EducationPage() {
  const { serviceCopy } = useLanguage();
  const meta = services.find((s) => s.key === "education");
  const copy = serviceCopy.education;

  return (
    <PageShell>
      <main className="page-main edu-page">
        <section className="edu-hero">
          <div className="edu-hero__blob edu-hero__blob--a" aria-hidden="true" />
          <div className="edu-hero__blob edu-hero__blob--b" aria-hidden="true" />

          <div className="container edu-hero__grid">
            <div data-reveal>
              <p className="eyebrow">{meta.num} — {copy.kicker}</p>
              <h1 className="display edu-hero__title">{copy.heading}</h1>
              <p className="lede edu-hero__desc">{copy.desc}</p>
              <div className="edu-hero__actions">
                <a href="#universities" className="btn btn--ink">
                  <span>Explore Universities <Arrow /></span>
                </a>
                <a href="/contact.html" className="btn btn--ghost">
                  <span>{copy.cta}</span>
                </a>
              </div>
            </div>

            <div className="edu-hero__visual" data-reveal>
              <img src={meta.img} alt="" loading="lazy" />
              <div className="edu-hero__badge">
                <span className="edu-hero__badge-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </span>
                <span>
                  <strong>500+</strong>
                  <em>Students placed</em>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="edu-details">
          <div className="container edu-details__grid">
            <div data-reveal>
              <h2 className="display edu-details__title">What's included</h2>
              <p className="edu-details__intro">Comprehensive support tailored for your educational journey in China.</p>
              <ul className="edu-details__list">
                {copy.items.map((item) => (
                  <li key={item}>
                    <span className="edu-details__check"><Check /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="edu-cta-card" data-reveal>
              <div className="edu-cta-card__glow" aria-hidden="true" />
              <div className="edu-cta-card__inner">
                <p className="eyebrow">Ready to get started?</p>
                <h3>Begin your application journey</h3>
                <p className="edu-cta-card__body">Reach out to our expert team — we'll guide you through every step of admission to a Chinese university.</p>
                <a href="/contact.html" className="btn btn--ink edu-cta-card__btn">
                  <span>{copy.cta} <Arrow /></span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <UniversitiesSection />
      </main>
    </PageShell>
  );
}
