import { useEffect, useState } from "react";
import PageShell from "./PageShell.jsx";
import { fetchCourses, resolveImageUrl } from "./data/coursesApi.js";
import { useAuth } from "./auth/AuthContext.jsx";
import * as authApi from "./data/authApi.js";

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

// Public CSCA / General course catalog — mirrors UniversitiesSection's live-
// fetch + card-grid pattern, filtered client-side by course type since the
// catalog is small enough that a full API round-trip per filter click isn't
// worth it.
function getTypeFromUrl() {
  const type = new URLSearchParams(window.location.search).get("type");
  return type === "CSCA" || type === "General" ? type : null;
}

export default function CoursesListPage({ defaultFilter = "CSCA" } = {}) {
  const auth = useAuth();
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(null);
  // A ?type= query param (e.g. from the Education page's General/CSCA
  // buttons) takes priority over the page's own default so the same
  // courses.html entry point can land pre-filtered either way.
  const [filter, setFilter] = useState(getTypeFromUrl() || defaultFilter);

  const [myRegistrations, setMyRegistrations] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!auth.user) {
      setMyRegistrations(null);
      return;
    }
    let cancelled = false;
    authApi.getMyRegistrations()
      .then((data) => { if (!cancelled) setMyRegistrations(data); })
      .catch(() => { if (!cancelled) setMyRegistrations([]); });
    return () => { cancelled = true; };
  }, [auth.user]);

  const visible = (courses || []).filter((c) => filter === "All" || c.courseType === filter);

  return (
    <PageShell>
      <main className="page-main course-list">
        <section className="course-list__hero">
          <div className="container">
            <p className="eyebrow">Courses &amp; Exam Prep</p>
            <h1 className="display course-list__title">CSCA exam preparation &amp; general courses</h1>
            <p className="lede course-list__desc">
              Structured prep for the China Scholastic Competency Assessment, plus general courses to get you ready for study in China.
            </p>
          </div>
        </section>

        <section className="course-list__body">
          <div className="container">
            {auth.user && (
              <p className="course-list__auth-strip">
                Logged in as <strong>{auth.user.fullName}</strong> · Registered for:{" "}
                {myRegistrations === null
                  ? "loading…"
                  : myRegistrations.length === 0
                    ? "you haven't registered for any courses yet."
                    : myRegistrations.map((r) => r.courseTitle).join(", ")}
                {" "}· <a href="/services/register.html">Register for another course</a>
              </p>
            )}

            <div className="course-list__filters">
              {["CSCA", "General", "All"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`course-list__filter-btn ${filter === t ? "is-active" : ""}`}
                  onClick={() => setFilter(t)}
                >
                  {t === "All" ? "All Courses" : t}
                </button>
              ))}
            </div>

            {error && <p className="course-list__status">{error}</p>}
            {!error && !courses && <p className="course-list__status">Loading…</p>}
            {!error && courses && visible.length === 0 && (
              <p className="course-list__status">No courses in this category yet — check back soon.</p>
            )}

            <div className="course-grid">
              {visible.map((c) => (
                <div key={c.courseID} className="course-tile" data-reveal>
                  <a href={`/services/course.html?id=${c.courseID}`} className="course-tile__cover">
                    {c.courseImageURL
                      ? <img src={resolveImageUrl(c.courseImageURL)} alt="" loading="lazy" />
                      : <div className="course-tile__cover-placeholder" />}
                    <span className={`course-tile__type ${c.courseType === "CSCA" ? "is-csca" : "is-general"}`}>{c.courseType}</span>
                  </a>
                  <div className="course-tile__body">
                    {c.categoryName && <p className="course-tile__category">{c.categoryName}</p>}
                    <a href={`/services/course.html?id=${c.courseID}`} className="course-tile__title-link">
                      <h3>{c.courseTitle}</h3>
                    </a>
                    {(c.duration || c.deliveryMethod) && (
                      <p className="course-tile__meta"><ClockIcon /> {[c.duration, c.deliveryMethod].filter(Boolean).join(" · ")}</p>
                    )}
                    {c.shortDescription && <p className="course-tile__desc">{c.shortDescription}</p>}
                    <div className="course-tile__footer">
                      {c.fee ? (
                        <span className="course-tile__price">{c.currencyCode} {Number(c.fee).toLocaleString()}</span>
                      ) : <span />}
                      <a href={`/services/course.html?id=${c.courseID}`} className="course-tile__link">View details <Arrow /></a>
                    </div>
                    <a
                      href={`/services/register.html?courseId=${encodeURIComponent(c.courseID)}`}
                      className="course-tile__register-btn"
                    >
                      Register
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
