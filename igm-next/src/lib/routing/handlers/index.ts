import type { Metadata } from "next";
import type { ReactNode } from "react";

import type { SiteRoute } from "../types";

import * as cartography from "./cartography";
import * as cms from "./cms";
import * as contact from "./contact";
import * as home from "./home";
import * as legislation from "./legislation";
import * as mediaGallery from "./mediaGallery";
import * as news from "./news";
import * as orgChart from "./orgChart";
import * as photos from "./photos";
import * as pressKit from "./pressKit";
import * as pressReview from "./pressReview";
import * as signalement from "./signalement";
import * as underConstruction from "./underConstruction";
import * as whoWeAre from "./whoWeAre";

export async function renderSiteRoute(route: SiteRoute): Promise<ReactNode> {
  switch (route.kind) {
    case "home":
      return home.renderHomeRoute(route);
    case "news-article":
      return news.renderNewsArticleRoute(route);
    case "news-listing":
      return news.renderNewsListingRoute(route);
    case "press-review-article":
      return pressReview.renderPressReviewArticleRoute(route);
    case "press-review-listing":
      return pressReview.renderPressReviewListingRoute(route);
    case "who-we-are-history":
      return whoWeAre.renderWhoWeAreHistoryRoute(route);
    case "who-we-are-section":
      return whoWeAre.renderWhoWeAreSectionRoute(route);
    case "photo-album":
      return photos.renderPhotoAlbumRoute(route);
    case "photos-listing":
      return photos.renderPhotosListingRoute(route);
    case "report":
      return signalement.renderReportRoute(route);
    case "map":
      return cartography.renderMapRoute(route);
    case "contact":
      return contact.renderContactRoute(route);
    case "press-kit":
      return pressKit.renderPressKitRoute(route);
    case "legislation":
      return legislation.renderLegislationRoute(route);
    case "videos":
      return mediaGallery.renderVideosRoute(route);
    case "org-chart":
      return orgChart.renderOrgChartRoute(route);
    case "cms-page":
      return cms.renderCmsPageRoute(route);
    case "page-hero-placeholder":
      return cms.renderPageHeroPlaceholderRoute(route);
    case "under-construction":
      return underConstruction.renderUnderConstructionRoute(route);
  }
}

export async function buildRouteMetadata(route: SiteRoute): Promise<Metadata> {
  switch (route.kind) {
    case "home":
      return home.buildHomeMetadata(route);
    case "news-article":
      return news.buildNewsArticleMetadata(route);
    case "news-listing":
      return news.buildNewsListingMetadata(route);
    case "press-review-article":
      return pressReview.buildPressReviewArticleMetadata(route);
    case "press-review-listing":
      return pressReview.buildPressReviewListingMetadata(route);
    case "who-we-are-history":
    case "who-we-are-section":
      return whoWeAre.buildWhoWeAreMetadata(route);
    case "photo-album":
      return photos.buildPhotoAlbumMetadata(route);
    case "photos-listing":
      return photos.buildPhotosListingMetadata(route);
    case "report":
      return signalement.buildReportMetadata(route);
    case "map":
      return cartography.buildMapMetadata(route);
    case "contact":
      return contact.buildContactMetadata(route);
    case "press-kit":
      return pressKit.buildPressKitMetadata(route);
    case "legislation":
      return legislation.buildLegislationMetadata(route);
    case "videos":
      return mediaGallery.buildVideosMetadata(route);
    case "org-chart":
      return orgChart.buildOrgChartMetadata(route);
    case "cms-page":
      return cms.buildCmsPageMetadata(route);
    case "page-hero-placeholder":
    case "under-construction":
      return underConstruction.buildPlaceholderMetadata(route);
  }
}
