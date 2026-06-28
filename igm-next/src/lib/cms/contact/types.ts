export type CmsContactPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroTitle?: string | null;
  heroLead?: string | null;
  eyebrow?: string | null;
  formTitle?: string | null;
  infoTitle?: string | null;
  infoLead?: string | null;
};

export type ResolvedContactPage = {
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroLead: string;
  eyebrow: string;
  formTitle: string;
  infoTitle: string;
  infoLead: string;
};
