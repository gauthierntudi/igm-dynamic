import { withDeployedBase } from "@/lib/deployBasePath";

export default function TemplateFooter() {
  return (
    <footer className="footer-section style-3">
      <div className="footer-top-stripe" />
      <div className="container">
        <div className="footer-menu-wrap">
          <div className="row">
            <div className="col-lg-3">
              <div className="company-logo-and-location-area">

                    <div className="company-logo-area">
                      <img
                        src={withDeployedBase("/assets/img/logo-unicolor.png")}
                        alt=""
                        style={{ maxHeight: 106, width: "auto" }}
                      />
                    </div>

                  
                    <ul className="location-list">
                      <li>
                        <span>Adresse du siège</span>
                        <a
                          href="#!"
                          style={{ textDecoration: "none", color:"#fff" }}
                        >
                          N°4808, Avenue Tabu Ley (Ex-Tombalbaye) Quartier Golf /
                          Commune de Gombe
                          <br />
                          Ville de Kinshasa
                          <br />
                          (Réf. : Eglise Notre Dame de Fatima)
                        </a>
                      </li>
                    </ul>


              </div>
            </div>
            <div className="col-lg-9">
              
              <div className="footer-menu">
                <div className="row gy-5">
                  <div className="col-lg-3 col-md-3 col-sm-6">
                    <div className="footer-widget">
                      <div className="widget-title">
                        <h3>Organes</h3>
                      </div>
                      <ul className="widget-list">
                        <li>
                          <a href="https://mines.gouv.cd/fr/" target="_blank" rel="noreferrer">
                            Ministère des Mines
                          </a>
                        </li>
                        <li>
                          <a href="https://sg-mines-rdc.cd/" target="_blank" rel="noreferrer">
                            Secrétariat des Mines
                          </a>
                        </li>
                        <li>
                          <a href="https://cami.cd/" target="_blank" rel="noreferrer">
                            CAMI
                          </a>
                        </li>
                        <li>
                          <a href="https://ctcpm.cd/fr/" target="_blank" rel="noreferrer">
                            CTCPM
                          </a>
                        </li>
                        <li>
                          <a href="https://ceec.cd/" target="_blank" rel="noreferrer">
                            CEEC
                          </a>
                        </li>
                        <li>
                          <a href="https://saemape.cd/" target="_blank" rel="noreferrer">
                            SAEMAPE
                          </a>
                        </li>
                        <li>
                          <a href="https://sgnc.cd/" target="_blank" rel="noreferrer">
                            SGNC
                          </a>
                        </li>
                        <li>
                          <a href="https://www.fomin.cd/" target="_blank" rel="noreferrer">
                            FOMIN
                          </a>
                        </li>
                        <li>
                          <a href="#!" target="_blank" rel="noreferrer">
                            ARECOMS
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-6 d-flex justify-content-lg-center">
                    <div className="footer-widget">
                      <div className="widget-title">
                        <h3>Liens utiles</h3>
                      </div>
                      <ul className="widget-list">
                        <li>
                          <a href="https://presidence.cd/" target="_blank" rel="noreferrer">
                            Présidence
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://www.primature.gouv.cd/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Primature
                          </a>
                        </li>
                        <li>
                          <a href="#!" target="_blank" rel="noreferrer">
                            CNLFM
                          </a>
                        </li>
                        <li>
                          <a href="https://www.cenaref.org/" target="_blank" rel="noreferrer">
                            CENAREF
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://www.interpol.int/fr"
                            target="_blank"
                            rel="noreferrer"
                          >
                            INTERPOL
                          </a>
                        </li>
                        <li>
                          <a href="https://cami.cd/" target="_blank" rel="noreferrer">
                            CAMI
                          </a>
                        </li>
                        <li>
                          <a href="https://ceec.cd/" target="_blank" rel="noreferrer">
                            CEEC
                          </a>
                        </li>
                        <li>
                          <a href="https://douane.gouv.cd/" target="_blank" rel="noreferrer">
                            DGDA
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-5 col-md-5 d-flex justify-content-lg-end">
                    <div className="newsletter-area">
                      <h3>Contact</h3>
                      <p className="footer-cta mb-3">
                        Besoin d’aide ou d’informations ? Contactez-nous dès maintenant.
                      </p>
                      <div className="footer-direct-contact">
                        <div className="item">
                          <i className="bx bx-phone" />
                          <a href="tel:+243900030005">+243 900 030 005</a>
                        </div>
                        <div className="item">
                          <i className="bx bx-envelope" />
                          <a href="mailto:info@igm.cd">info@igm.cd</a>
                        </div>
                      </div>
                      <div className="social-area">
                        <h5>Réseaux sociaux</h5>
                        <ul className="social-list">
                          <li>
                            <a href="https://www.facebook.com/">
                              <i className="bi bi-facebook" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.linkedin.com/">
                              <i className="bi bi-linkedin" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.youtube.com/">
                              <i className="bi bi-youtube" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.instagram.com/">
                              <i className="bi bi-instagram" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.x.com/">
                              <i className="bi bi-twitter-x" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="copyright-and-social-area">
            <p>
              Copyright 2026 <a href="https://www.igm.cd/">IGM</a> |
              All Right Reserved.
            </p>
            <div className="terms-condition">
              <p>
              <a href="#" style={{ textDecoration: "none", color:"#fff" }}>Conditions Générales</a>
              </p>
              <p>
              <a href="#" style={{ textDecoration: "none", color:"#fff" }}>Politiques des cookies</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
