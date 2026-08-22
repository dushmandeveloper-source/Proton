import { useEffect, useState } from "react";
import PageShell from "./PageShell.jsx";
import { fetchCourses, resolveImageUrl } from "./data/coursesApi.js";

const Arrow = () => (
  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

// Dedicated CSCA landing page — the destination for the "Explore CSCA
// Courses" card on the Education service page. Combines static exam-facts
// (subjects, format, sessions) with the live CSCA course catalog from
// /api/courses?courseType=CSCA, so the page works even before any CSCA
// course rows exist yet.
export default function CscaPage() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourses({ courseType: "CSCA" })
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  const facts = [
    { label: "Subjects", value: "Math (compulsory) + Chinese, Physics, Chemistry" },
    { label: "Format", value: "Online proctored, computer-based, or paper-based" },
    { label: "Sessions", value: "5x/year — Jan, Mar, Apr, Jun, Dec" },
    { label: "Validity", value: "2 years from result release" },
  ];

  return (
    <PageShell>
      <main className="page-main csca-page">
        <section className="csca-hero">
          <div className="csca-hero__blob csca-hero__blob--a" aria-hidden="true" />
          <div className="csca-hero__blob csca-hero__blob--b" aria-hidden="true" />
          <div className="container csca-hero__inner">
            <p className="eyebrow csca-hero__eyebrow">CSCA Exam Preparation</p>
            <h1 className="display csca-hero__title">Get ready for the China Scholastic Competency Assessment</h1>
            <p className="lede csca-hero__desc">
              The CSCA is China's standardized entrance exam for international undergraduate applicants — mandatory for
              Chinese Government Scholarship applicants from 2026, and for all international undergraduates by 2028.
              Our prep courses cover every compulsory and optional subject with real exam-session schedules.
            </p>
            <div className="csca-hero__actions">
              <a href="#csca-courses" className="btn btn--ink"><span>View CSCA Courses <Arrow /></span></a>
              <a href="/contact.html" className="btn btn--ghost"><span>Talk to an advisor</span></a>
            </div>
          </div>
        </section>

        <section className="csca-facts">
          <div className="container csca-facts__grid">
            {facts.map((f) => (
              <div key={f.label} className="csca-facts__card" data-reveal>
                <p className="csca-facts__label">{f.label}</p>
                <p className="csca-facts__value">{f.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="course-list__body" id="csca-courses">
          <div className="container">
            <div className="csca-courses__intro">
              <h2 className="display">CSCA prep courses</h2>
              <p className="lede">Structured tracks by subject and proficiency level.</p>
            </div>

            {error && <p className="course-list__status">{error}</p>}
            {!error && !courses && <p className="course-list__status">Loading…</p>}
            {!error && courses && courses.length === 0 && (
              <p className="course-list__status">CSCA courses are being finalized — check back soon, or get in touch to be notified.</p>
            )}

            <div className="course-grid">
              {(courses || []).map((c) => (
                <a key={c.courseID} href={`/services/course.html?id=${c.courseID}`} className="course-tile" data-reveal>
                  <div className="course-tile__cover">
                    {c.courseImageURL
                      ? <img src={resolveImageUrl(c.courseImageURL)} alt="" loading="lazy" />
                      : <div className="course-tile__cover-placeholder" />}
                    <span className="course-tile__type is-csca">CSCA</span>
                  </div>
                  <div className="course-tile__body">
                    {c.categoryName && <p className="course-tile__category">{c.categoryName}</p>}
                    <h3>{c.courseTitle}</h3>
                    {(c.duration || c.deliveryMethod) && (
                      <p className="course-tile__meta"><ClockIcon /> {[c.duration, c.deliveryMethod].filter(Boolean).join(" · ")}</p>
                    )}
                    {c.shortDescription && <p className="course-tile__desc">{c.shortDescription}</p>}
                    <div className="course-tile__footer">
                      {c.fee ? (
                        <span className="course-tile__price">{c.currencyCode} {Number(c.fee).toLocaleString()}</span>
                      ) : <span />}
                      <span className="course-tile__link">View details <Arrow /></span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
