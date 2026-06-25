"use client";

import { useSiteNavigation } from "@/components/providers/SiteSettingsProvider";
import { withDeployedBase } from "@/lib/deployBasePath";

export default function TemplateFooter() {
  const nav = useSiteNavigation();

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
                    <span>{nav.footerHqHeading}</span>
                    <a href="#!" className="igm-footer-hq-address">
                      {nav.footerHqText.split("\n").map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-9">
              <div className="footer-menu">
                <div className="row gy-5">
                  {nav.footerColumns.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      className={
                        colIndex === 0
                          ? "col-lg-3 col-md-3 col-sm-6"
                          : colIndex === 1
                            ? "col-lg-4 col-md-4 col-sm-6 d-flex justify-content-lg-center"
                            : "col-lg-3 col-md-3 col-sm-6"
                      }
                    >
                      <div className="footer-widget">
                        <div className="widget-title">
                          <h3>{column.title}</h3>
                        </div>
                        <ul className="widget-list">
                          {column.links.map((link, linkIndex) => (
                            <li key={linkIndex}>
                              <a
                                href={link.href}
                                {...(link.openInNewTab
                                  ? { target: "_blank", rel: "noreferrer" }
                                  : {})}
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  <div className="col-lg-5 col-md-5 d-flex justify-content-lg-end">
                    <div className="newsletter-area">
                      <h3>{nav.footerContactTitle}</h3>
                      <p className="footer-cta mb-3">{nav.footerContactLead}</p>
                      <div className="footer-direct-contact">
                        <div className="item">
                          <i className="bx bx-phone" />
                          <a href={`tel:${nav.footerContactPhone.replace(/\s/g, "")}`}>
                            {nav.footerContactPhone}
                          </a>
                        </div>
                        <div className="item">
                          <i className="bx bx-envelope" />
                          <a href={`mailto:${nav.footerContactEmail}`}>{nav.footerContactEmail}</a>
                        </div>
                      </div>
                      <div className="social-area">
                        <h5>{nav.footerSocialTitle}</h5>
                        <ul className="social-list">
                          {nav.footerSocial.map((social) => (
                            <li key={social.network}>
                              <a href={social.url} target="_blank" rel="noreferrer">
                                <i className={`bi ${social.iconClass}`} />
                              </a>
                            </li>
                          ))}
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
            <p>{nav.footerCopyright}</p>
            <div className="terms-condition">
              {nav.footerLegalLinks.map((link, index) => (
                <p key={index}>
                  <a
                    href={link.href}
                    style={{ textDecoration: "none", color: "#fff" }}
                    {...(link.openInNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
