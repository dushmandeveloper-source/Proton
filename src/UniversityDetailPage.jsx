import { useEffect, useState } from "react";
import PageShell from "./PageShell.jsx";
import { fetchUniversity, resolveImageUrl } from "./data/universitiesApi.js";

function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id") || "";
}

// Public detail page for one university — cover, logo, gallery, features,
// programs and intakes, pulled live from /api/universities/{id}. Reached
// from UniversitiesList's cards on the Education service page.
export default function UniversityDetailPage() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    const id = getIdFromUrl();
    if (!id) {
      setState({ loading: false, error: "No university specified.", data: null });
      return;
    }
    let cancelled = false;
    fetchUniversity(id)
      .then((data) => { if (!cancelled) setState({ loading: false, error: null, data }); })
      .catch((err) => { if (!cancelled) setState({ loading: false, error: err.message, data: null }); });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <PageShell>
        <main className="page-main uni-detail">
          <div className="container uni-detail__status">Loading…</div>
        </main>
      </PageShell>
    );
  }

  if (state.error || !state.data) {
    return (
      <PageShell>
        <main className="page-main uni-detail">
          <div className="container uni-detail__status">
            <p>{state.error || "University not found."}</p>
            <a href="/services/education.html" className="btn btn--ink"><span>Back to Universities</span></a>
          </div>
        </main>
      </PageShell>
    );
  }

  const { university: u, gallery, features, programs, intakes } = state.data;

  return (
    <PageShell>
      <main className="page-main uni-detail">
        <section className="uni-detail__hero">
          {u.coverImageURL && <img className="uni-detail__cover" src={resolveImageUrl(u.coverImageURL)} alt="" />}
          <div className="uni-detail__hero-overlay" />
          <div className="container uni-detail__hero-content">
            <a href="/services/education.html" className="uni-detail__back">&larr; All Universities</a>
            <div className="uni-detail__identity">
              {u.logoURL && <img className="uni-detail__logo" src={resolveImageUrl(u.logoURL)} alt="" />}
              <div>
                <h1 className="display uni-detail__name">{u.name}</h1>
                <p className="uni-detail__loc">
                  {[u.city, u.province, u.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="uni-detail__body">
          <div className="container uni-detail__grid">
            <div className="uni-detail__main">
              {u.shortDescription && <p className="lede">{u.shortDescription}</p>}

              {u.aboutHtml && (
                <div className="uni-detail__section">
                  <h2 className="display">About</h2>
                  <div className="uni-detail__prose" dangerouslySetInnerHTML={{ __html: u.aboutHtml }} />
                </div>
              )}

              {gallery && gallery.length > 0 && (
                <div className="uni-detail__section">
                  <h2 className="display">Gallery</h2>
                  <div className="uni-detail__gallery">
                    {gallery.map((g) => (
                      <figure key={g.galleryID}>
                        <img src={resolveImageUrl(g.imageURL)} alt={g.caption || ""} loading="lazy" />
                        {g.caption && <figcaption>{g.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {features && features.length > 0 && (
                <div className="uni-detail__section">
                  <h2 className="display">Highlights</h2>
                  <ul className="uni-detail__features">
                    {features.map((f) => (
                      <li key={f.featureID}>
                        <strong>{f.title}</strong>
                        {f.description && <span>{f.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {programs && programs.length > 0 && (
                <div className="uni-detail__section">
                  <h2 className="display">Programs</h2>
                  <div className="uni-detail__table-wrap">
                    <table className="uni-detail__table">
                      <thead>
                        <tr><th>Level</th><th>Program</th><th>Duration</th><th>Language</th><th>Tuition/yr</th></tr>
                      </thead>
                      <tbody>
                        {programs.map((p) => (
                          <tr key={p.programID}>
                            <td>{p.programLevel}</td>
                            <td>{p.programName}</td>
                            <td>{p.durationText || "—"}</td>
                            <td>{p.languageOfInstruction || "—"}</td>
                            <td>{p.tuitionPerYear ? `${u.currencyCode} ${Number(p.tuitionPerYear).toLocaleString()}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {u.admissionRequirementsHtml && (
                <div className="uni-detail__section">
                  <h2 className="display">Admission Requirements</h2>
                  <div className="uni-detail__prose" dangerouslySetInnerHTML={{ __html: u.admissionRequirementsHtml }} />
                </div>
              )}

              {u.requiredDocumentsHtml && (
                <div className="uni-detail__section">
                  <h2 className="display">Required Documents</h2>
                  <div className="uni-detail__prose" dangerouslySetInnerHTML={{ __html: u.requiredDocumentsHtml }} />
                </div>
              )}
            </div>

            <aside className="uni-detail__aside">
              <div className="uni-detail__card">
                <h3>Costs (per year)</h3>
                <dl>
                  <dt>Tuition</dt>
                  <dd>{u.tuitionMin || u.tuitionMax ? `${u.currencyCode} ${Number(u.tuitionMin ?? 0).toLocaleString()}–${Number(u.tuitionMax ?? 0).toLocaleString()}` : "—"}</dd>
                  <dt>Accommodation</dt>
                  <dd>{u.accommodationCostMin || u.accommodationCostMax ? `${u.currencyCode} ${Number(u.accommodationCostMin ?? 0).toLocaleString()}–${Number(u.accommodationCostMax ?? 0).toLocaleString()}` : "—"}</dd>
                  <dt>Living costs</dt>
                  <dd>{u.livingCostMin || u.livingCostMax ? `${u.currencyCode} ${Number(u.livingCostMin ?? 0).toLocaleString()}–${Number(u.livingCostMax ?? 0).toLocaleString()}` : "—"}</dd>
                </dl>
              </div>

              {intakes && intakes.length > 0 && (
                <div className="uni-detail__card">
                  <h3>Intakes</h3>
                  <ul className="uni-detail__intakes">
                    {intakes.map((i) => (
                      <li key={i.intakeID}>
                        <strong>{i.intakeName}</strong>
                        <span>{i.intakeMonth}{i.applicationDeadline ? ` · deadline ${new Date(i.applicationDeadline).toLocaleDateString()}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {u.websiteURL && (
                <a href={u.websiteURL} target="_blank" rel="noreferrer" className="btn btn--ink uni-detail__site-link">
                  <span>Visit official site</span>
                </a>
              )}
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
