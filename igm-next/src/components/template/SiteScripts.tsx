import Script from "next/script";

import { withDeployedBase } from "@/lib/deployBasePath";
import { SITE_SCRIPT_FILES } from "@/lib/template/siteAssets";

export function SiteScripts() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
        strategy="afterInteractive"
      />
      <Script src={withDeployedBase(SITE_SCRIPT_FILES.gsap)} strategy="afterInteractive" />
      <Script src={withDeployedBase(SITE_SCRIPT_FILES.scrollTrigger)} strategy="afterInteractive" />
      <Script src={withDeployedBase(SITE_SCRIPT_FILES.splitText)} strategy="afterInteractive" />
      <Script
        id="template-mobile-menu"
        src={withDeployedBase(SITE_SCRIPT_FILES.mobileMenu)}
        strategy="afterInteractive"
      />
      <Script
        id="template-swiper-init"
        src={withDeployedBase(SITE_SCRIPT_FILES.swiperInit)}
        strategy="afterInteractive"
      />
      <Script
        id="template-sticky-header"
        src={withDeployedBase(SITE_SCRIPT_FILES.stickyHeader)}
        strategy="afterInteractive"
      />
    </>
  );
}
