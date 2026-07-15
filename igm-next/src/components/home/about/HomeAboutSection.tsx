import type { CmsHomeAbout } from "@/lib/cms/home/types";

import { resolveAboutImageAlt, resolveAboutImageSrc } from "./resolveAboutMedia";

type Props = {
  about: CmsHomeAbout | null | undefined;
};

export function hasAboutContent(about: CmsHomeAbout | null | undefined): about is CmsHomeAbout {
  if (!about) return false;
  return Boolean(
    about.title?.trim() ||
      about.leadText?.trim() ||
      about.detailText?.trim() ||
      about.signatureName?.trim() ||
      (about.image && typeof about.image === "object"),
  );
}

function DetailText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <p className="detail-text">
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export function HomeAboutSection({ about }: Props) {
  if (!hasAboutContent(about)) return null;

  const imageSrc = resolveAboutImageSrc(about.image);
  const imageAlt = resolveAboutImageAlt(about.image);

  return (
    <div className="home4-about-section mb-130 mt-100">
      <div className="container">
        <div className="row align-items-center">
          <div
            className="col-lg-5 wow animate fadeInLeft"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <div className="about-image-block">
              <div className="image-wrapper" style={{ position: "relative" }}>
                <img src={imageSrc} alt={imageAlt} />
              </div>
            </div>
          </div>
          <div
            className="col-lg-7 wow animate fadeInRight"
            data-wow-delay="400ms"
            data-wow-duration="1500ms"
          >
            <div className="about-content">
              {about.title?.trim() ? <h1>{about.title.trim()}</h1> : null}
              <div className="main-text">
                {about.leadText?.trim() ? (
                  <p className="lead-text">{about.leadText.trim()}</p>
                ) : null}
                {about.detailText?.trim() ? (
                  <DetailText text={about.detailText.trim()} />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeAboutSection;
