import { withDeployedBase } from "@/lib/deployBasePath";
import { BRAND_CSS_VARIABLES, TEMPLATE_CSS_FILES } from "@/lib/template/siteAssets";

export function SiteHead() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href={withDeployedBase("/assets/img/flaticon.png")} sizes="20x20" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow:ital,wght@0,400;0,600;0,700;1,400&family=Barlow+Condensed:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Dancing+Script:wght@400..700&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
      />
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />
      {TEMPLATE_CSS_FILES.map((href) => (
        <link key={href} rel="stylesheet" href={withDeployedBase(href)} />
      ))}
      <style>{BRAND_CSS_VARIABLES}</style>
    </>
  );
}
