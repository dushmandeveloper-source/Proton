import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <i aria-hidden="true" /> PROTON
            </div>
            <p>{t.footer.tagline}</p>
          </div>
          <div>
            <h5>{t.footer.platformsTitle}</h5>
            <ul>
              {t.footer.platforms.map((p) => (
                <li key={p}><a href="#services">{p}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h5>{t.footer.contactTitle}</h5>
            <ul>
              <li>{t.footer.address}</li>
              <li><a href="mailto:info@protonplatform.com">info@protonplatform.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <div>{t.footer.copyright}</div>
          <div>
            <a href="#top">{t.footer.privacy}</a> &nbsp;·&nbsp; <a href="#top">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
