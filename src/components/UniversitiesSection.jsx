import { useEffect, useState } from "react";
import { fetchUniversities, resolveImageUrl } from "../data/universitiesApi.js";
import UniversitiesMap from "./UniversitiesMap.jsx";

const Arrow = () => (
  <svg className="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Live directory of partner universities from the Proton_Admin database:
// an eyebrow/heading intro, the interactive map (UniversitiesMap), and a
// card grid below it. Sits at the bottom of the Education service page.
export default function UniversitiesSection() {
  const [universities, setUniversities] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchUniversities()
      .then((data) => { if (!cancelled) setUniversities(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  if (error) return null; // fail quietly — the rest of the static page still works
  if (!universities || universities.length === 0) return null;

  return (
    <section className="uni-section" id="universities">
      <div className="container">
        <div className="uni-section__intro">
          <p className="eyebrow uni-section__eyebrow">Partner Institutions</p>
          <h2 className="display uni-section__title">Universities we work with</h2>
          <p className="lede uni-section__lede">Explore our network of prestigious partner universities across China.</p>
        </div>

        <UniversitiesMap universities={universities} />

        <div className="uni-grid">
          {universities.map((u) => (
            <a key={u.universityID} href={`/services/university.html?id=${u.universityID}`} className="uni-tile" data-reveal>
              <div className="uni-tile__cover">
                {u.coverImageURL
                  ? <img src={resolveImageUrl(u.coverImageURL)} alt="" loading="lazy" />
                  : <div className="uni-tile__cover-placeholder" />}
                <div className="uni-tile__cover-fade" />
                {u.logoURL && (
                  <span className="uni-tile__logo-chip">
                    <img src={resolveImageUrl(u.logoURL)} alt="" loading="lazy" />
                  </span>
                )}
              </div>
              <div className="uni-tile__body">
                <span className="uni-tile__badge" aria-hidden="true"><CapIcon /></span>
                <h3>{u.name}</h3>
                <p className="uni-tile__loc"><PinIcon /> {[u.city, u.province].filter(Boolean).join(", ") || u.country}</p>
                {u.shortDescription && <p className="uni-tile__desc">{u.shortDescription}</p>}
                <span className="uni-tile__link">View details <Arrow /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
