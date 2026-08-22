import { useEffect, useState } from "react";
import PageShell from "./PageShell.jsx";
import { fetchCourse, resolveImageUrl } from "./data/coursesApi.js";

function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id") || "";
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Public detail page for one course (General or CSCA) — pulled live from
// /api/courses/{id}. Mirrors UniversityDetailPage's structure: hero, main
// content column, sidebar summary card. Content sections (outcomes, training
// points, requirements, pathways) match what the LMS_System reference shows
// on a public course page; CSCA subjects/schedules replace its cart/enroll
// flow since student enrollment is a later phase here.
export default function CourseDetailPage() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    const id = getIdFromUrl();
    if (!id) {
      setState({ loading: false, error: "No course specified.", data: null });
      return;
    }
    let cancelled = false;
    fetchCourse(id)
      .then((data) => { if (!cancelled) setState({ loading: false, error: null, data }); })
      .catch((err) => { if (!cancelled) setState({ loading: false, error: err.message, data: null }); });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <PageShell>
        <main className="page-main course-detail">
          <div className="container course-detail__status">Loading…</div>
        </main>
      </PageShell>
    );
  }

  if (state.error || !state.data) {
    return (
      <PageShell>
        <main className="page-main course-detail">
          <div className="container course-detail__status">
            <p>{state.error || "Course not found."}</p>
            <a href="/services/courses.html" className="btn btn--ink"><span>Back to Courses</span></a>
          </div>
        </main>
      </PageShell>
    );
  }

  const { course: c, subjects, schedules } = state.data;
  const isCSCA = c.courseType === "CSCA";

  return (
    <PageShell>
      <main className="page-main course-detail">
        <section className={`course-detail__hero ${isCSCA ? "is-csca" : ""}`}>
          {c.courseImageURL && <img className="course-detail__cover" src={resolveImageUrl(c.courseImageURL)} alt="" />}
          <div className="course-detail__hero-overlay" />
          <div className="container course-detail__hero-content">
            <a href="/services/courses.html" className="course-detail__back">&larr; All Courses</a>
            <span className={`course-detail__type-badge ${isCSCA ? "is-csca" : "is-general"}`}>{c.courseType}</span>
            {c.categoryName && <p className="course-detail__category">{c.categoryName}</p>}
            <h1 className="display course-detail__name">{c.courseTitle}</h1>
            {(c.duration || c.deliveryMethod || c.locationName) && (
              <p className="course-detail__meta">
                {[c.duration, c.deliveryMethod, c.locationName].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </section>

        <section className="course-detail__body">
          <div className="container course-detail__grid">
            <div className="course-detail__main">
              {c.shortDescription && <p className="lede">{c.shortDescription}</p>}

              {c.aboutHtml && (
                <div className="course-detail__section">
                  <h2 className="display">About this course</h2>
                  <div className="course-detail__prose" dangerouslySetInnerHTML={{ __html: c.aboutHtml }} />
                </div>
              )}

              {c.descriptions && c.descriptions.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">What's covered</h2>
                  <ul className="course-detail__checklist">
                    {c.descriptions.map((d, i) => (
                      <li key={i}><CheckIcon /><span>{d.descriptionText}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {isCSCA && subjects && subjects.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">Exam subjects</h2>
                  <div className="course-detail__table-wrap">
                    <table className="course-detail__table">
                      <thead>
                        <tr><th>Subject</th><th>Language</th><th>Duration</th><th>Type</th></tr>
                      </thead>
                      <tbody>
                        {subjects.map((s) => (
                          <tr key={s.subjectID}>
                            <td>{s.subjectName}</td>
                            <td>{s.language}</td>
                            <td>{s.durationMinutes ? `${s.durationMinutes} min` : "—"}</td>
                            <td>{s.isCompulsory ? "Compulsory" : "Optional"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {c.outcomes && c.outcomes.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">Learning outcomes</h2>
                  <ul className="course-detail__checklist">
                    {c.outcomes.map((o, i) => (
                      <li key={i}><CheckIcon /><span>{o.outcomeDescription}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {c.trainingPoints && c.trainingPoints.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">Training points</h2>
                  <ul className="course-detail__checklist">
                    {c.trainingPoints.map((t, i) => (
                      <li key={i}><CheckIcon /><span>{t.pointDescription}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {c.requirements && c.requirements.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">Requirements</h2>
                  <ul className="course-detail__checklist">
                    {c.requirements.map((r, i) => (
                      <li key={i}><CheckIcon /><span>{r.requirementText}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {c.pathways && c.pathways.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">Pathways</h2>
                  <div className="course-detail__pathways">
                    {c.pathways.map((p, i) => (
                      <div key={i} className="course-detail__pathway-card">
                        <p>{p.pathwayDescription}</p>
                        {p.certificationText && <span>{p.certificationText}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schedules && schedules.length > 0 && (
                <div className="course-detail__section">
                  <h2 className="display">{isCSCA ? "Upcoming exam sessions" : "Upcoming batches"}</h2>
                  <div className="course-detail__table-wrap">
                    <table className="course-detail__table">
                      <thead>
                        <tr><th>Batch</th><th>Date</th><th>Time</th><th>Location</th></tr>
                      </thead>
                      <tbody>
                        {schedules.map((s) => (
                          <tr key={s.scheduleID}>
                            <td>{s.scheduleName || "—"}</td>
                            <td>{s.scheduleDate ? new Date(s.scheduleDate).toLocaleDateString() : "—"}</td>
                            <td>{s.timeRangeText || "—"}</td>
                            <td>{s.location || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <aside className="course-detail__aside">
              <div className="course-detail__card">
                <h3>Course Summary</h3>
                <dl>
                  {c.categoryName && (<><dt>Category</dt><dd>{c.categoryName}</dd></>)}
                  {c.duration && (<><dt>Duration</dt><dd>{c.duration}</dd></>)}
                  {c.deliveryMethod && (<><dt>Delivery</dt><dd>{c.deliveryMethod}</dd></>)}
                  {c.locationName && (<><dt>Location</dt><dd>{c.locationName}</dd></>)}
                  {c.certificateValidity && (<><dt>Certificate validity</dt><dd>{c.certificateValidity}</dd></>)}
                  {c.fee ? (<><dt>Fee</dt><dd>{c.currencyCode} {Number(c.fee).toLocaleString()}</dd></>) : null}
                </dl>
              </div>

              {c.pricingDetails && c.pricingDetails.length > 0 && (
                <div className="course-detail__card">
                  <h3>Pricing Tiers</h3>
                  <ul className="course-detail__pricing">
                    {c.pricingDetails.map((p, i) => (
                      <li key={i}>
                        <span>{p.pricingTier}</span>
                        <span>
                          {p.originalPrice && p.originalPrice !== p.sellingPrice && (
                            <em>{c.currencyCode} {Number(p.originalPrice).toLocaleString()}</em>
                          )}
                          {p.sellingPrice ? `${c.currencyCode} ${Number(p.sellingPrice).toLocaleString()}` : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.feeCharges && c.feeCharges.length > 0 && (
                <div className="course-detail__card">
                  <h3>Additional Charges</h3>
                  <ul className="course-detail__pricing">
                    {c.feeCharges.map((f, i) => (
                      <li key={i}>
                        <span>{f.feeType}</span>
                        <span>{f.amount ? `${c.currencyCode} ${Number(f.amount).toLocaleString()}` : "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.comboOffers && c.comboOffers.length > 0 && (
                <div className="course-detail__card">
                  <h3>Combo Offers</h3>
                  <ul className="course-detail__intakes">
                    {c.comboOffers.map((co, i) => (
                      <li key={i}>
                        <strong>{co.comboDescription}</strong>
                        {co.comboDuration && <span>{co.comboDuration}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.handbookFileURL && (
                <a href={resolveImageUrl(c.handbookFileURL)} target="_blank" rel="noreferrer" className="btn btn--ink course-detail__handbook-link">
                  <span>{c.handbookTitle || "Download Course Handbook"}</span>
                </a>
              )}

              <a href="/contact.html" className="btn btn--ink course-detail__enquire-link">
                <span>Enquire about this course</span>
              </a>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
