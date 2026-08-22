import { useEffect, useState } from "react";
import { fetchCourses, resolveImageUrl } from "../data/coursesApi.js";

const Arrow = () => (
  <svg className="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

const PREVIEW_COUNT = 6;

// Live course preview on the Education service page: an eyebrow/heading
// intro, up to PREVIEW_COUNT cards, and a "View all courses" button once
// there are more than that — same live-fetch pattern as UniversitiesSection,
// pointing at the full catalog (courses.html) and the dedicated CSCA
// landing page (csca.html) for the two directions a visitor can drill into.
export default function CoursesSection() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  if (error) return null; // fail quietly — the rest of the static page still works
  if (!courses || courses.length === 0) return null;

  const preview = courses.slice(0, PREVIEW_COUNT);

  return (
    <section className="course-section" id="courses">
      <div className="container">
        <div className="course-section__intro">
          <p className="eyebrow course-section__eyebrow">Courses</p>
          <h2 className="display course-section__title">CSCA prep &amp; general courses</h2>
          <p className="lede course-section__lede">A look at what's currently open for enrollment — browse the full catalog or jump straight to CSCA exam prep.</p>
        </div>

        <div className="course-grid">
          {preview.map((c) => (
            <a key={c.courseID} href={`/services/course.html?id=${c.courseID}`} className="course-tile" data-reveal>
              <div className="course-tile__cover">
                {c.courseImageURL
                  ? <img src={resolveImageUrl(c.courseImageURL)} alt="" loading="lazy" />
                  : <div className="course-tile__cover-placeholder" />}
                <span className={`course-tile__type ${c.courseType === "CSCA" ? "is-csca" : "is-general"}`}>{c.courseType}</span>
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

        <div className="course-section__actions">
          <a href="/services/courses.html?type=General" className="btn btn--ink">
            <span>View General Courses <Arrow /></span>
          </a>
          <a href="/services/csca.html" className="btn btn--ghost">
            <span>View CSCA Courses <Arrow /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
