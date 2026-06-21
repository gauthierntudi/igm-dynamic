import { DenoncerOpenTrigger } from "@/components/signalement/DenoncerOpenTrigger";
import { withDeployedBase } from "@/lib/deployBasePath";

export default function TemplateHeader() {
  return (
    <>
      <div className="right-sidebar-menu">
        <div className="sidebar-logo-area d-flex justify-content-between align-items-center">
          <div className="sidebar-logo-wrap">
            <a href="/">
              <img
                alt="image"
                src={withDeployedBase("/assets/img/logo-color.png")}
                className="light"
              />
              <img
                alt="image"
                src={withDeployedBase("/assets/img/logo-unicolor.png")}
                className="dark"
              />
            </a>
          </div>
          <div className="right-sidebar-close-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.6694 3.0106C14.8839 2.78848 15.0026 2.49099 15 2.18219C14.9973 1.8734 14.8734 1.57801 14.6551 1.35966C14.4367 1.1413 14.1413 1.01744 13.8325 1.01475C13.5237 1.01207 13.2262 1.13078 13.0041 1.34531L8.00706 6.34236L3.01119 1.34531C2.90184 1.23589 2.77202 1.14907 2.62912 1.08983C2.48623 1.03058 2.33306 1.00005 2.17837 1C2.02368 0.999945 1.87049 1.03036 1.72756 1.08951C1.58462 1.14865 1.45473 1.23538 1.34531 1.34472C1.23589 1.45407 1.14907 1.58389 1.08983 1.72679C1.03058 1.86968 1.00005 2.02285 1 2.17754C0.999945 2.33223 1.03036 2.48542 1.08951 2.62835C1.14865 2.77129 1.23538 2.90118 1.34472 3.0106L6.34177 8.00765L1.34472 13.0047C1.12389 13.2257 0.99989 13.5253 1 13.8378C1.00011 14.1502 1.12432 14.4497 1.34531 14.6706C1.5663 14.8914 1.86596 15.0154 2.17837 15.0153C2.49078 15.0152 2.79036 14.891 3.01119 14.67L8.00706 9.67294L13.0041 14.67C13.2262 14.8845 13.5237 15.0032 13.8325 15.0005C14.1413 14.9979 14.4367 14.874 14.6551 14.6556C14.8734 14.4373 14.9973 14.1419 15 13.8331C15.0026 13.5243 14.8839 13.2268 14.6694 13.0047L9.67235 8.00765L14.6694 3.0106Z"
              />
            </svg>
          </div>
        </div>
        <div className="sidebar-content-wrap">
          <div className="sidebar-content">
            <h3>Numéro Vert</h3>
            <ul className="contact-area">
              <li className="single-contact">
                <div className="icon">
                  <img
                    src={withDeployedBase("/assets/img/home1/icon/contact-call-icon.svg")}
                    alt=""
                  />
                </div>
                <div className="content">
                  <span>Numéro Vert</span>
                  <h6>
                    <a href="tel:+243976844563">+243 97 684 4563</a>
                  </h6>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <header className="header-area style-4">
        <div className="container-fluid d-flex flex-nowrap align-items-center justify-content-between">
          <div className="company-logo">
            <a className="logo-dark" href="/">
              <img
                alt="image"
                className="img-fluid"
                src={withDeployedBase("/assets/img/logo-color.png")}
                style={{ maxHeight: 62, width: "auto" }}
              />
            </a>
            <a className="logo-light" href="/">
              <img
                alt="image"
                className="img-fluid"
                src={withDeployedBase("/assets/img/logo-unicolor.png")}
                style={{ maxHeight: 62, width: "auto" }}
              />
            </a>
          </div>

          <div className="menu-wrap">
            <div className="main-menu">
              <div className="mobile-logo-area d-lg-none d-flex align-items-center justify-content-between">
                <a className="mobile-logo-wrap" href="/">
                  <img
                    alt="image"
                    className="img-fluid light"
                    src={withDeployedBase("/assets/img/logo-color.png")}
                    style={{ maxHeight: 56, width: "auto" }}
                  />
                  <img
                    alt="image"
                    className="img-fluid dark"
                    src={withDeployedBase("/assets/img/logo-unicolor.png")}
                    style={{ maxHeight: 56, width: "auto" }}
                  />
                </a>
                <div className="menu-close-btn">
                  <i className="bi bi-x" />
                </div>
              </div>

              <ul className="menu-list">
                <li>
                  <a href="/">Accueil</a>
                </li>

                <li className="menu-item-has-children">
                  <a className="drop-down" href="#">
                    Présentation
                  </a>
                  <i className="bi bi-plus dropdown-icon" />
                  <ul className="sub-menu none">
                    <li className="menu-item-has-children">
                      <a href="#">Qui sommes-nous ?</a>
                      <i className="d-lg-flex d-none bi-caret-right-fill dropdown-icon" />
                      <ul className="sub-menu none">
                        <li>
                          <a href="/a-propos">A propos</a>
                        </li>
                        <li>
                          <a href="/historique">Historique</a>
                        </li>
                        <li>
                          <a href="/mission">Mission</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="/organigramme">Organigramme</a>
                    </li>
                    <li>
                      <a href="/cartographie">Cartographie</a>
                    </li>
                  </ul>
                </li>

                <li className="menu-item-has-children">
                  <a className="drop-down" href="#">
                    LCFCM
                  </a>
                  <i className="bi bi-plus dropdown-icon" />
                  <ul className="sub-menu none">
                    <li>
                      <a href="/fraude-miniere">Fraude minière</a>
                    </li>
                    <li>
                      <a href="/contrebande-miniere">Contrebande minière</a>
                    </li>
                    <li>
                      <DenoncerOpenTrigger variant="navSubmenu" />
                    </li>
                    <li>
                      <a href="/sanctions">Sanctions</a>
                    </li>
                  </ul>
                </li>

                <li className="nav-hide-1020">
                  <a href="/actualites">Actualités</a>
                </li>

                <li className="menu-item-has-children nav-hide-1565">
                  <a className="drop-down" href="#">
                    Législation
                  </a>
                  <i className="bi bi-plus dropdown-icon" />
                  <ul className="sub-menu none">
                    <li>
                      <a href="/ordonnances">Ordonnances</a>
                    </li>
                    <li>
                      <a href="/lois">Lois</a>
                    </li>
                    <li>
                      <a href="/decrets">Décrets</a>
                    </li>
                    <li>
                      <a href="/decisions">Décisions</a>
                    </li>
                  </ul>
                </li>

                <li className="menu-item-has-children nav-hide-1565">
                  <a className="drop-down" href="#">
                    Médiathèque
                  </a>
                  <i className="bi bi-plus dropdown-icon" />
                  <ul className="sub-menu none">
                    <li>
                      <a href="/photos">Photos</a>
                    </li>
                    <li>
                      <a href="/videos">Vidéos</a>
                    </li>
                    <li>
                      <a href="/audios">Audios</a>
                    </li>
                  </ul>
                </li>

                <li className="menu-item-has-children nav-show-1565">
                  <a className="drop-down" href="#">
                    Ressources
                  </a>
                  <i className="bi bi-plus dropdown-icon" />
                  <ul className="sub-menu none">
                    <li className="nav-show-1020">
                      <a href="/actualites">Actualités</a>
                    </li>
                    <li className="menu-item-has-children">
                      <a href="#">Législation</a>
                      <i className="bi bi-plus dropdown-icon" />
                      <ul className="sub-menu none">
                        <li>
                          <a href="/ordonnances">Ordonnances</a>
                        </li>
                        <li>
                          <a href="/lois">Lois</a>
                        </li>
                        <li>
                          <a href="/decrets">Décrets</a>
                        </li>
                        <li>
                          <a href="/decisions">Décisions</a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a href="#">Médiathèque</a>
                      <i className="bi bi-plus dropdown-icon" />
                      <ul className="sub-menu none">
                        <li>
                          <a href="/photos">Photos</a>
                        </li>
                        <li>
                          <a href="/videos">Vidéos</a>
                        </li>
                        <li>
                          <a href="/audios">Audios</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="/contact">Contact</a>
                    </li>
                  </ul>
                </li>

                <li className="nav-hide-1565">
                  <a href="/contact">Contact</a>
                </li>
              </ul>

              <div className="d-lg-none" style={{ padding: "10px 0 24px" }}>
                <div className="contact-area" style={{ padding: "0 0 16px" }}>
                  <div className="icon">
                    <i className="bx bx-phone" style={{ fontSize: 26 }} />
                  </div>
                  <div className="content">
                    <span>Numéro Vert</span>
                    <h6 style={{ margin: 0 }}>
                      <a href="tel:+243976844563">+243 97 684 4563</a>
                    </h6>
                  </div>
                </div>

                <DenoncerOpenTrigger
                  variant="primary"
                  className="primary-btn4"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="nav-right">
              <div className="contact-area d-lg-flex d-none">
                <div className="icon">
                  <i className="bx bx-phone" style={{ fontSize: 30 }} />
                </div>
                <div className="content">
                  <span>Numéro Vert</span>
                  <h6>
                    <a href="tel:+243976844563">+243 97 684 4563</a>
                  </h6>
                </div>
              </div>

              <DenoncerOpenTrigger variant="primary" className="primary-btn4 d-lg-flex d-none" />

              <div className="sidebar-button mobile-menu-btn">
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1.29445 2.8421H10.5237C11.2389 2.8421 11.8182 2.2062 11.8182 1.42105C11.8182 0.635903 11.2389 0 10.5237 0H1.29445C0.579249 0 0 0.635903 0 1.42105C0 2.2062 0.579249 2.8421 1.29445 2.8421Z" />
                  <path d="M1.23002 10.421H18.77C19.4496 10.421 20 9.78506 20 8.99991C20 8.21476 19.4496 7.57886 18.77 7.57886H1.23002C0.550421 7.57886 0 8.21476 0 8.99991C0 9.78506 0.550421 10.421 1.23002 10.421Z" />
                  <path d="M18.8052 15.1579H10.2858C9.62563 15.1579 9.09094 15.7938 9.09094 16.5789C9.09094 17.3641 9.62563 18 10.2858 18H18.8052C19.4653 18 20 17.3641 20 16.5789C20 15.7938 19.4653 15.1579 18.8052 15.1579Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
