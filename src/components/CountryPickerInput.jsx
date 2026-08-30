import { useMemo, useRef, useState } from "react";
import { COUNTRIES } from "../data/countries.js";

// React port of the admin side's searchable, flag-annotated country/
// nationality picker (backend/Web_Backend/wwwroot/js/country-picker.js).
// Renders as a plain text input with a flag badge that appears once the
// current value matches a known country, plus a dropdown of up to 50
// filtered matches (flag + name) shown while typing/focused.
//
// mode: "country" matches/displays the country name; "nationality"
// matches/displays the demonym (e.g. "Sri Lankan" instead of "Sri Lanka").
export default function CountryPickerInput({ id, label, value, onChange, mode = "country", required = false, placeholder }) {
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  const labelOf = mode === "nationality" ? (c) => c.nationality : (c) => c.name;

  const query = (value || "").trim().toLowerCase();

  const matches = useMemo(() => {
    return COUNTRIES.filter((c) => !query || labelOf(c).toLowerCase().indexOf(query) !== -1).slice(0, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mode]);

  const activeMatch = useMemo(
    () => COUNTRIES.find((c) => labelOf(c).toLowerCase() === (value || "").trim().toLowerCase()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, mode]
  );

  function handleFocus() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setOpen(true);
  }

  function handleBlur() {
    // Short delay so a click on a dropdown row can register before the
    // dropdown unmounts (mirrors the vanilla widget's setTimeout(close, 100)).
    blurTimeout.current = setTimeout(() => setOpen(false), 100);
  }

  function handleSelect(country) {
    onChange(labelOf(country));
    setOpen(false);
  }

  return (
    <div className="register-page__field">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="country-picker">
        {activeMatch && (
          <img className="country-picker__badge" src={activeMatch.flagUrl} alt="" />
        )}
        <input
          id={id}
          type="text"
          autoComplete="off"
          required={required}
          placeholder={placeholder}
          className={`country-picker__input${activeMatch ? " has-badge" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {open && (
          <div className="country-picker__list">
            {matches.length === 0 ? (
              <div className="country-picker__empty">No matches</div>
            ) : (
              matches.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  className="country-picker__option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(c);
                  }}
                >
                  <img src={c.flagUrl} alt="" />
                  <span>{labelOf(c)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
