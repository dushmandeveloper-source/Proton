import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { resolveImageUrl } from "../data/universitiesApi.js";

// Circular photo pin — a campus photo/logo in a ring, teardrop tail beneath.
// Scales up on hover so the pin the visitor is pointing at is unmistakable;
// falls back to an initial-letter avatar when a university has no logo.
function photoPinIcon(logoUrl, name) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const resolved = resolveImageUrl(logoUrl);
  const avatar = resolved
    ? `<img src="${resolved}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.replaceWith(Object.assign(document.createElement('div'),{style:'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eaf0f9;color:#1d4ed8;font:700 18px General Sans, sans-serif;',textContent:'${initial}'}))" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#eaf0f9;color:#1d4ed8;font:700 18px General Sans, sans-serif;">${initial}</div>`;

  return L.divIcon({
    className: "uni-map-pin",
    html:
      `<div class="uni-map-pin__wrap">` +
        `<div class="uni-map-pin__ring">${avatar}</div>` +
        `<div class="uni-map-pin__tail"></div>` +
      `</div>`,
    iconSize: [46, 56],
    iconAnchor: [23, 56],
    popupAnchor: [0, -56],
  });
}

// Interactive map of every mapped partner university — real geography
// (zoom/pan), Carto basemap tiles, circular photo pins that scale up on
// hover, and a floating glass info card (name/location/link) that follows
// whichever pin the visitor is pointing at, mirroring the reference design.
export default function UniversitiesMap({ universities }) {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const mapped = universities.filter((u) => u.hasCoordinates ?? (u.latitude && u.longitude));
    if (!containerRef.current || mapped.length === 0) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      detectRetina: true,
    }).addTo(map);

    const markers = mapped.map((u) => {
      const marker = L.marker([u.latitude, u.longitude], { icon: photoPinIcon(u.logoURL, u.name) });
      marker.addTo(map);

      const el = marker.getElement();
      if (el) {
        el.addEventListener("mouseenter", () => {
          marker.setZIndexOffset(1000);
          setHovered(u);
        });
        el.addEventListener("mouseleave", () => marker.setZIndexOffset(0));
        el.addEventListener("click", () => {
          window.location.href = `/services/university.html?id=${u.universityID}`;
        });
      }
      return marker;
    });

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
    if (mapped.length === 1) map.setZoom(11);

    return () => map.remove();
  }, [universities]);

  const mapped = universities.filter((u) => u.hasCoordinates ?? (u.latitude && u.longitude));
  if (mapped.length === 0) return null;

  return (
    <div className="uni-map">
      <div
        className="uni-map__frame"
        ref={containerRef}
        onMouseLeave={() => setHovered(null)}
      />
      <div className={`uni-map__info-card${hovered ? " is-visible" : ""}`}>
        {hovered && (
          <>
            <div className="uni-map__info-icon">
              {hovered.logoURL
                ? <img src={resolveImageUrl(hovered.logoURL)} alt="" />
                : <span>{hovered.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <h4>{hovered.name}</h4>
              <p>{[hovered.city, hovered.province].filter(Boolean).join(", ")}</p>
              <a href={`/services/university.html?id=${hovered.universityID}`}>View details &rarr;</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
