export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <i aria-hidden="true" /> PROTON
            </div>
            <p>
              A professional Sino–Lanka cooperation platform providing legal, compliant, and
              reliable cross-border services in education, healthcare, business, and industrial
              development.
            </p>
          </div>
          <div>
            <h5>Our Platforms</h5>
            <ul>
              <li><a href="#services">Education Services</a></li>
              <li><a href="#services">Medical &amp; Healthcare</a></li>
              <li><a href="#services">Business &amp; Investment</a></li>
              <li><a href="#services">Industrial &amp; Technology</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact Us</h5>
            <ul>
              <li>Colombo, Western Province, Sri Lanka</li>
              <li><a href="mailto:info@protonplatform.com">info@protonplatform.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <div>© 2026 PROTON Services Platform. All rights reserved.</div>
          <div>
            <a href="#top">Privacy Policy</a> &nbsp;·&nbsp; <a href="#top">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
