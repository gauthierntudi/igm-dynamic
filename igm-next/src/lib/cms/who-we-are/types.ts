import type { CmsMedia } from "../types";

export type CmsWhoWeAreLabelItem = {
  label?: string | null;
  id?: string | null;
};

export type CmsWhoWeAreTeamMember = {
  name?: string | null;
  role?: string | null;
  photo?: CmsMedia | number | null;
  id?: string | null;
};

export type CmsWhoWeAreMilestone = {
  year?: string | null;
  title?: string | null;
  text?: string | null;
  segmentColor?: string | null;
  bubbleColor?: string | null;
  link?: CmsWhoWeAreCta | null;
  id?: string | null;
};

export type CmsWhoWeAreStat = {
  label?: string | null;
  value?: string | null;
  id?: string | null;
};

export type CmsWhoWeAreCta = {
  label?: string | null;
  navLink?: string | null;
  customHref?: string | null;
};

export type CmsWhoWeAre = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroTitle?: string | null;
  headline?: string | null;
  intro?: string | null;
  heroImage?: CmsMedia | number | null;
  navAboutLabel?: string | null;
  navHistoryLabel?: string | null;
  navMissionLabel?: string | null;
  aboutSection?: {
    title?: string | null;
    body?: string | null;
    image?: CmsMedia | number | null;
    quote?: {
      text?: string | null;
      authorName?: string | null;
      authorRole?: string | null;
      authorPhoto?: CmsMedia | number | null;
    } | null;
  } | null;
  historySection?: {
    title?: string | null;
    lead?: string | null;
    timelineIntro?: string | null;
    headline?: string | null;
    body?: string | null;
    heroImage?: CmsMedia | number | null;
    ctaImage?: CmsMedia | number | null;
    teaserImage1?: CmsMedia | number | null;
    teaserImage2?: CmsMedia | number | null;
    milestones?: CmsWhoWeAreMilestone[] | null;
  } | null;
  missionSection?: {
    title?: string | null;
    lead?: string | null;
    headline?: string | null;
    body?: string | null;
    image?: CmsMedia | number | null;
    statutoryTitle?: string | null;
    statutoryItems?: CmsWhoWeAreLabelItem[] | null;
    prioritiesTitle?: string | null;
    priorities?: CmsWhoWeAreLabelItem[] | null;
  } | null;
  statsSection?: {
    items?: CmsWhoWeAreStat[] | null;
  } | null;
  teamSection?: {
    title?: string | null;
    lead?: string | null;
    members?: CmsWhoWeAreTeamMember[] | null;
  } | null;
  ctaSection?: {
    title?: string | null;
    text?: string | null;
    link?: CmsWhoWeAreCta | null;
  } | null;
  contactSection?: {
    title?: string | null;
    lead?: string | null;
    primaryCta?: CmsWhoWeAreCta | null;
    phoneLabel?: string | null;
    phoneHref?: string | null;
    image?: CmsMedia | number | null;
  } | null;
};
