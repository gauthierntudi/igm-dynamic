import { withDeployedBase } from "@/lib/deployBasePath";

/** Source react-pdf same-origin (évite CORS sur le CDN). */
export function pdfViewSource(url: string) {
  return {
    url: withDeployedBase(url),
    withCredentials: false as const,
  };
}
