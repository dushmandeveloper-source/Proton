import PageShell from "./PageShell.jsx";
import { useLanguage } from "./i18n/LanguageContext.jsx";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <main className="page-main contact-page">
        <section className="contact-hero">
          <div className="container">
            <p className="eyebrow" data-reveal>{t.contactPage.eyebrow}</p>
            <h1 className="display contact-hero__title" data-reveal>{t.contactPage.title}</h1>
            <p className="lede contact-hero__intro" data-reveal>{t.contactPage.intro}</p>
          </div>
        </section>

        <section className="contact-body">
          <div className="container contact-body__grid">
            <div className="contact-info" data-reveal>
              <h5>{t.footer.contactTitle}</h5>
              <ul>
                <li>{t.footer.address}</li>
                <li><a href="mailto:info@protonplatform.com">info@protonplatform.com</a></li>
              </ul>
            </div>

            <form
              className="contact-form"
              data-reveal
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="contact-form__field">
                <span>{t.contactPage.formName}</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label className="contact-form__field">
                <span>{t.contactPage.formEmail}</span>
                <input type="email" name="email" autoComplete="email" required />
              </label>
              <label className="contact-form__field">
                <span>{t.contactPage.formMessage}</span>
                <textarea name="message" rows="6" required />
              </label>
              <button type="submit" className="btn btn--ink contact-form__submit">
                <span>{t.contactPage.formSubmit}</span>
              </button>
            </form>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
