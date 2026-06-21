import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

import IgToastContainer from "@/components/providers/IgToastContainer";
import SignalementAnchorBridge from "@/components/signalement/SignalementAnchorBridge";
import { SignalementModalProvider } from "@/components/signalement/SignalementModalProvider";
import { withDeployedBase } from "@/lib/deployBasePath";
import TemplateFooter from "@/components/template/Footer";
import TemplateHeader from "@/components/template/Header";

import "./globals.css";

const ENABLE_LOADER = true;

export const metadata: Metadata = {
  title: "IGM",
};

const templateCssFiles = [
  "/template_next/static/css/23541da8cc5249d8.css",
  "/template_next/static/css/b9561bab1231773f.css",
  "/template_next/static/css/eb7fb74b893d85cc.css",
  "/template_next/static/css/db9a24d1f688739d.css",
  "/template_next/static/css/f171f2c129af25c2.css",
  "/template_next/static/css/6791ed030e36249f.css",
  "/template_next/static/css/b60c7510b0bb27b3.css",
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withDeployedBase("/assets/img/flaticon.png")} sizes="20x20" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;1,400&family=Barlow+Condensed:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Dancing+Script:wght@400..700&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          rel="stylesheet"
        />
        {templateCssFiles.map((href) => (
          <link key={href} rel="stylesheet" href={withDeployedBase(href)} />
        ))}
        <style>{`:root{--primary-color1:#1b4491;--primary-color1-opc:27,68,145;--primary-color3:#065ab0;--primary-color3-opc:6,90,176;--bs-purple:#0560b7;--bs-indigo:#0657ac;--brand-red:#e20405;--brand-yellow:#f6bf0d;}`}</style>
      </head>
      <body>
        {ENABLE_LOADER && (
          <div
            id="igm-loader"
            className="igm-loader"
            role="status"
            aria-live="polite"
          >
            <div className="igm-loader-inner">
              <img
                className="igm-loader-icon"
                src={withDeployedBase("/assets/img/flaticon.png")}
                alt="IGM"
              />
              <div
                className="igm-loader-typewriter"
                aria-label="Inspection Générale de Mines — Bienvenue"
              >
                <div className="line is-typing" />
              </div>
              <div className="igm-loader-progress" aria-label="Chargement">
                <span className="value">0%</span>
              </div>
            </div>
          </div>
        )}
        {ENABLE_LOADER && (
          <Script
            id="igm-loader-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function () {
  var root = document.getElementById("igm-loader");
  if (!root) return;

  root.setAttribute("data-init", "1");

  var words = ["Inspection", "Générale", "de Mines", "Bienvenue"];
  var el = root.querySelector(".igm-loader-typewriter .line");
  if (!el) return;
  var progressEl = root.querySelector(".igm-loader-progress .value");
  var loaded = false;
  var startedAt = Date.now();

  var wordIndex = 0;
  var charIndex = 0;
  var mode = "typing";
  var progressStarted = false;
  var progressValue = 0;

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function step() {
    if (!el) return;
    var word = words[wordIndex] || "";

    if (mode === "typing") {
      charIndex = Math.min(word.length, charIndex + 1);
      el.textContent = word.slice(0, charIndex);

      if (charIndex >= word.length) {
        if (wordIndex >= words.length - 1) {
          startProgress();
          return;
        }
        mode = "pause";
        setTimeout(function () {
          mode = "deleting";
          step();
        }, 420);
        return;
      }

      setTimeout(step, rand(22, 44));
      return;
    }

    if (mode === "deleting") {
      charIndex = Math.max(0, charIndex - 1);
      el.textContent = word.slice(0, charIndex);

      if (charIndex <= 0) {
        wordIndex = Math.min(words.length - 1, wordIndex + 1);
        mode = "typing";
        setTimeout(step, 160);
        return;
      }

      setTimeout(step, rand(16, 28));
      return;
    }
  }

  function hide() {
    if (!root || root.classList.contains("is-hidden")) return;

    function removeRoot() {
      if (!root) return;
      root.classList.add("is-hidden");
      if (root && root.parentNode) root.parentNode.removeChild(root);
    }

    var gsap = typeof window !== "undefined" ? window.gsap : null;
    if (gsap && typeof gsap.timeline === "function") {
      var inner = root.querySelector(".igm-loader-inner");
      root.classList.add("is-hiding");
      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          onComplete: removeRoot,
        })
        .set(root, { pointerEvents: "none" }, 0)
        .to(inner || root, { y: -10, scale: 0.98, opacity: 0, duration: 0.5 }, 0)
        .to(root, { opacity: 0, duration: 0.55 }, 0);
      return;
    }

    root.classList.add("is-hiding");
    setTimeout(removeRoot, 520);
  }

  function setProgress(value) {
    progressValue = value;
    if (progressEl) progressEl.textContent = value + "%";
  }

  function progressTick() {
    if (!progressStarted) return;
    if (!progressEl) return;

    if (progressValue < 90) {
      setProgress(progressValue + 1);
      setTimeout(progressTick, 18);
      return;
    }

    if (progressValue < 99) {
      setProgress(progressValue + 1);
      setTimeout(progressTick, 60);
      return;
    }

    if (!loaded) {
      setTimeout(progressTick, 120);
      return;
    }

    setProgress(100);
    hide();
  }

  function startProgress() {
    if (progressStarted) return;
    progressStarted = true;
    setTimeout(function () {
      root.classList.add("is-progress");
      el.textContent = "";
      setProgress(0);
      progressTick();
    }, 4000);
  }

  function markLoaded() {
    loaded = true;
  }

  window.addEventListener("load", function () {
    markLoaded();
  });

  if (document.readyState === "complete") {
    markLoaded();
  }

  step();
})();`,
            }}
          />
        )}
        <Script
          src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
          strategy="afterInteractive"
        />
        <Script src={withDeployedBase("/assets/js/gsap.min.js")} strategy="afterInteractive" />
        <Script
          src={withDeployedBase("/assets/js/ScrollTrigger.min.js")}
          strategy="afterInteractive"
        />
        <Script src={withDeployedBase("/assets/js/SplitText.min.js")} strategy="afterInteractive" />
        <Script
          id="template-mobile-menu"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  function getMainMenuFromTarget(target) {
    var header = target.closest("header");
    if (!header) return document.querySelector(".main-menu");
    return header.querySelector(".main-menu") || document.querySelector(".main-menu");
  }

  function closeMenu(menu) {
    if (!menu) return;
    menu.classList.remove("show-menu");
    document.body.style.overflow = "";
  }

  function openMenu(menu) {
    if (!menu) return;
    menu.classList.add("show-menu");
    document.body.style.overflow = "hidden";
  }

  function setLiOpenState(li, open) {
    if (!li || !(li instanceof Element)) return;

    li.classList.toggle("is-open", open);

    var icon = li.querySelector(":scope > .dropdown-icon");
    if (icon && icon.classList) {
      if (icon.classList.contains("bi-plus") || icon.classList.contains("bi-dash")) {
        icon.classList.toggle("bi-plus", !open);
        icon.classList.toggle("bi-dash", open);
      }
    }
  }

  function closeSiblingDropdowns(li) {
    if (!li || !li.parentElement) return;

    var siblings = li.parentElement.children;
    for (var i = 0; i < siblings.length; i++) {
      var sib = siblings[i];
      if (sib !== li && sib.classList && sib.classList.contains("is-open")) {
        setLiOpenState(sib, false);
      }
    }
  }

  function toggleDropdownFromElement(el) {
    if (!el || !(el instanceof Element)) return;

    var li = el.closest("li.menu-item-has-children");
    if (!li) return;

    var willOpen = !li.classList.contains("is-open");
    closeSiblingDropdowns(li);
    setLiOpenState(li, willOpen);
  }

  document.addEventListener("click", function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;

    var openBtn = target.closest(".mobile-menu-btn");
    if (openBtn) {
      openMenu(getMainMenuFromTarget(openBtn));
      return;
    }

    var closeBtn = target.closest(".menu-close-btn");
    if (closeBtn) {
      closeMenu(getMainMenuFromTarget(closeBtn));
      return;
    }

    var dropdownIcon = target.closest(".dropdown-icon");
    if (dropdownIcon) {
      if (
        dropdownIcon.classList &&
        (dropdownIcon.classList.contains("bi-plus") ||
          dropdownIcon.classList.contains("bi-dash"))
      ) {
        toggleDropdownFromElement(dropdownIcon);
      }
      return;
    }

    var hashLink = target.closest('a[href="#"]');
    if (hashLink) {
      var inDropdown = hashLink.closest("li.menu-item-has-children");
      if (inDropdown) {
        e.preventDefault();
        toggleDropdownFromElement(hashLink);
        return;
      }
    }

    var openDropdown = target.closest("header.header-area li.menu-item-has-children.is-open");
    if (!openDropdown) {
      var allOpen = document.querySelectorAll(
        "header.header-area li.menu-item-has-children.is-open",
      );
      for (var j = 0; j < allOpen.length; j++) {
        setLiOpenState(allOpen[j], false);
      }
    }

    var openMenuEl = document.querySelector(".main-menu.show-menu");
    if (openMenuEl) {
      var clickedInsideMenu = target.closest(".main-menu");
      var clickedMenuButton = target.closest(".mobile-menu-btn");
      if (!clickedInsideMenu && !clickedMenuButton) {
        closeMenu(openMenuEl);
      }
    }
  });
})();`,
          }}
        />
        <Script
          id="template-swiper-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  function initBannerSlider() {
    if (typeof window === "undefined") return false;
    var SwiperCtor = window.Swiper;
    if (typeof SwiperCtor !== "function") return false;

    var slider = document.querySelector(".home4-banner-slider");
    if (!slider) return false;
    if (slider.swiper) return true;

    var pagination = document.querySelector(".home4-banner-pagination");

    function setHeaderHeroModeFromSwiper(swiper) {
      if (!swiper || !swiper.slides) return;
      var activeSlide = swiper.slides[swiper.activeIndex];
      var type = activeSlide ? activeSlide.getAttribute("data-type") : null;
      var isCover = type === "slide-image-cover";
      if (document && document.body) {
        document.body.classList.toggle("header-hero-dark", !!isCover);
      }
    }

    var bannerSwiper = new SwiperCtor(".home4-banner-slider", {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: 800,
      effect: "fade",
      fadeEffect: { crossFade: true },
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: pagination
        ? {
            el: ".home4-banner-pagination",
            clickable: true,
          }
        : undefined,
      on: {
        init: function (swiper) {
          setHeaderHeroModeFromSwiper(swiper);
        },
        slideChange: function (swiper) {
          setHeaderHeroModeFromSwiper(swiper);
        },
      },
    });

    setHeaderHeroModeFromSwiper(bannerSwiper);

    return true;
  }

  function initTeamSlider() {
    if (typeof window === "undefined") return false;
    var SwiperCtor = window.Swiper;
    if (typeof SwiperCtor !== "function") return false;

    var slider = document.querySelector(".home4-team-slider");
    if (!slider) return false;
    if (slider.swiper) return true;

    var pagination = document.querySelector(".swiper-pagination1");

    new SwiperCtor(".home4-team-slider", {
      slidesPerView: 4,
      spaceBetween: 24,
      loop: true,
      speed: 700,
      pagination: pagination
        ? {
            el: ".swiper-pagination1",
            clickable: true,
          }
        : undefined,
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 16 },
        576: { slidesPerView: 2, spaceBetween: 16 },
        992: { slidesPerView: 4, spaceBetween: 24 },
      },
    });

    return true;
  }

  function initNewsSlider() {
    if (typeof window === "undefined") return false;
    var SwiperCtor = window.Swiper;
    if (typeof SwiperCtor !== "function") return false;

    var slider = document.querySelector(".igm-news-slider");
    if (!slider) return true;
    if (slider.swiper) return true;

    var pagination = document.querySelector(".igm-news-pagination");

    new SwiperCtor(".igm-news-slider", {
      slidesPerView: 1.08,
      spaceBetween: 16,
      centeredSlides: true,
      speed: 500,
      watchOverflow: true,
      pagination: pagination
        ? {
            el: ".igm-news-pagination",
            clickable: true,
            dynamicBullets: true,
          }
        : undefined,
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
          centeredSlides: false,
        },
        992: {
          slidesPerView: 4,
          spaceBetween: 24,
          centeredSlides: false,
        },
      },
    });

    return true;
  }

  function initTestimonialSlider() {
    if (typeof window === "undefined") return false;
    var SwiperCtor = window.Swiper;
    if (typeof SwiperCtor !== "function") return false;

    var slider = document.querySelector(".home2-testimonial-slider");
    if (!slider) return false;
    if (slider.swiper) return true;

    var nextEl = document.querySelector(".testimonial-slider-next");
    var prevEl = document.querySelector(".testimonial-slider-prev");

    new SwiperCtor(".home2-testimonial-slider", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 700,
      autoHeight: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      navigation:
        nextEl && prevEl
          ? {
              nextEl: ".testimonial-slider-next",
              prevEl: ".testimonial-slider-prev",
            }
          : undefined,
    });

    return true;
  }

  function initMissionVisionSlider() {
    if (typeof window === "undefined") return false;
    var SwiperCtor = window.Swiper;
    if (typeof SwiperCtor !== "function") return false;

    var slider = document.querySelector(".mission-vision-slider");
    if (!slider) return false;
    if (slider.swiper) return true;

    new SwiperCtor(".mission-vision-slider", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      speed: 600,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".mission-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"></span>';
        },
      },
    });

    return true;
  }

  function initCounterUp() {
    if (typeof window === "undefined") return false;

    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return false;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            if (el.getAttribute("data-animating") === "true") return;

            var targetStr = el.getAttribute("data-target");
            if (!targetStr) return;
            var target = parseFloat(targetStr);
            if (isNaN(target)) return;

            el.setAttribute("data-animating", "true");

            // Restart circle animation if part of a circle chart
            var parentItem = el.closest(".chiffre-item");
            if (parentItem) {
              var circleFill = parentItem.querySelector(".circle-chart-fill");
              if (circleFill) {
                var percentage = circleFill.getAttribute("data-percentage");
                circleFill.style.strokeDasharray = percentage + ", 100";
              }
            }

            var duration = 2000; // ms
            var startTime = null;

            function animate(currentTime) {
              if (!startTime) startTime = currentTime;
              var progress = currentTime - startTime;
              var currentCount = (progress / duration) * target;
              
              if (target % 1 === 0) {
                el.innerText = Math.min(Math.floor(currentCount), target);
              } else {
                el.innerText = Math.min(currentCount, target).toFixed(1);
              }

              if (progress < duration) {
                requestAnimationFrame(animate);
              } else {
                el.setAttribute("data-animating", "false");
                el.innerText = target; // Ensure exact final value
              }
            }
            requestAnimationFrame(animate);
          } else {
            // Reset when out of view
            el.innerText = "0";
            el.setAttribute("data-animating", "false");
            var parentItem = el.closest(".chiffre-item");
            if (parentItem) {
              var circleFill = parentItem.querySelector(".circle-chart-fill");
              if (circleFill) {
                circleFill.style.strokeDasharray = "0, 100";
              }
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });

    return true;
  }

  function retry(attempt) {
    var okBanner = initBannerSlider();
    var okTeam = initTeamSlider();
    var okNews = initNewsSlider();
    var okTestimonial = initTestimonialSlider();
    var okMission = initMissionVisionSlider();
    var okCounter = initCounterUp();
    if (okBanner && okTeam && okNews && okTestimonial && okMission && okCounter) return;
    if (attempt >= 30) return;
    setTimeout(function () {
      retry(attempt + 1);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      retry(0);
    });
  } else {
    retry(0);
  }
})();`,
          }}
        />
        <Script
          id="template-home4-contact"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  function activate(container) {
    if (!container) return;
    container.classList.add("active");
  }

  function init() {
    var container = document.querySelector(".home4-contact-btn-area");
    if (!container) return;

    activate(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();`,
          }}
        />
        <Script
          id="template-sticky-header"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  var header = document.querySelector("header.header-area");
  if (!header) return;

  var threshold = header.offsetHeight || 60;

  function onScroll() {
    var shouldStick = window.scrollY > threshold;
    if (shouldStick) header.classList.add("sticky");
    else header.classList.remove("sticky");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();`,
          }}
        />
        <SignalementModalProvider>
          <SignalementAnchorBridge />
          <IgToastContainer />
          <TemplateHeader />
          {children}
          <TemplateFooter />
        </SignalementModalProvider>
      </body>
    </html>
  );
}
