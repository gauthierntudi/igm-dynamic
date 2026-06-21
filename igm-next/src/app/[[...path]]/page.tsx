import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";
import { notFound } from "next/navigation";

import { deployedBasePath } from "@/lib/deployBasePath";
import { applyCmsStatsToHtml } from "@/lib/cms/applyStats";
import { getStats } from "@/lib/cms/client";

/** Seules ces routes servent le template d’accueil ; tout le reste = page en construction. */
const PUBLISHED_HOME_FILE = "marketing-agency.html";
const HTML_SUBDIR = "html";

/**
 * Ordre : `html/marketing-agency.html` à la racine de l’app (recommandé déploiement),
 * puis à la racine de l’app, puis dossier parent (repo local IGM/ à côté de igm-next/).
 */
function resolvePublishedHomeAbsolutePath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, HTML_SUBDIR, PUBLISHED_HOME_FILE),
    path.join(cwd, PUBLISHED_HOME_FILE),
    path.resolve(cwd, "..", PUBLISHED_HOME_FILE),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function isPublishedHomePage(segments: string[]): boolean {
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0] === "marketing-agency") return true;
  return false;
}

function extractBodyInnerHtml(html: string): string | null {
  const lower = html.toLowerCase();

  const bodyStart = lower.indexOf("<body");
  if (bodyStart === -1) return null;

  const bodyOpenEnd = html.indexOf(">", bodyStart);
  if (bodyOpenEnd === -1) return null;

  const bodyEnd = lower.lastIndexOf("</body>");
  if (bodyEnd === -1 || bodyEnd <= bodyOpenEnd) return null;

  return html.slice(bodyOpenEnd + 1, bodyEnd);
}

function stripNextRuntimeScripts(bodyInnerHtml: string): string {
  return bodyInnerHtml.replace(/<script\b[\s\S]*?<\/script>/gi, (scriptTag) => {
    if (
      scriptTag.includes("_next/static/chunks/") ||
      scriptTag.includes("__next_f") ||
      scriptTag.includes("__next_s") ||
      scriptTag.includes("__next")
    ) {
      return "";
    }

    return scriptTag;
  });
}

function stripAllScripts(bodyInnerHtml: string): string {
  return bodyInnerHtml.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function rewriteUrls(html: string): string {
  let out = html;

  out = out.replaceAll('src="assets/', 'src="/assets/');
  out = out.replaceAll('href="assets/', 'href="/assets/');
  out = out.replace(/url\(\s*assets\//g, "url(/assets/");

  out = out.replaceAll(
    'href="_next/static/css/',
    'href="/template_next/static/css/',
  );
  out = out.replaceAll(
    'href="_next/static/media/',
    'href="/template_next/static/media/',
  );
  out = out.replaceAll(
    'src="_next/static/media/',
    'src="/template_next/static/media/',
  );

  out = out.replace(/href="([^"]+)\.html"/g, (match, href: string) => {
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) {
      return match;
    }

    if (href === "index") return 'href="/"';
    if (href === "marketing-agency") return 'href="/"';

    if (href.startsWith("/")) {
      return `href="${href}"`;
    }

    return `href="/${href}"`;
  });

  return out;
}

/** Préfixe les chemins absolus du HTML marketing quand l’app est sous BASE_PATH (ex. /igm). */
function prefixInjectedHtmlRootPaths(html: string): string {
  const basePath = deployedBasePath();
  if (!basePath) return html;

  const prefix = (path: string): string => {
    if (!path.startsWith("/") || path.startsWith("//")) return path;
    if (path === basePath || path.startsWith(`${basePath}/`)) return path;
    return `${basePath}${path}`;
  };

  let out = html.replace(/(href|src)=(["'])(\/[^"']*)\2/gi, (_m, attr: string, quote: string, path: string) => {
    return `${attr}=${quote}${prefix(path)}${quote}`;
  });

  out = out.replace(/url\((["']?)(\/[^)"']+)\1\)/gi, (_m, q: string, path: string) => {
    return `url(${q}${prefix(path)}${q})`;
  });

  return out;
}

function stripSharedChrome(bodyInnerHtml: string): string {
  let out = bodyInnerHtml;

  out = out.replace(
    /<div\b[^>]*class="[^"]*\btt-style-switch\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    "",
  );

  const sidebarStart = out.indexOf('<div class="right-sidebar-menu"');
  const headerStart = out.indexOf("<header", sidebarStart === -1 ? 0 : sidebarStart);
  if (headerStart !== -1) {
    const headerEnd = out.indexOf("</header>", headerStart);
    if (headerEnd !== -1) {
      const start = sidebarStart !== -1 ? sidebarStart : headerStart;
      out = out.slice(0, start) + out.slice(headerEnd + "</header>".length);
    }
  }

  const footerStart = out.indexOf("<footer");
  if (footerStart !== -1) {
    const footerEnd = out.indexOf("</footer>", footerStart);
    if (footerEnd !== -1) {
      out = out.slice(0, footerStart) + out.slice(footerEnd + "</footer>".length);
    }
  }

  return out;
}

function UnderConstruction() {
  return (
    <main className="igm-under-construction" role="status" aria-live="polite">
      <div className="igm-under-construction-inner">
        <div className="igm-under-construction-card">
          <div className="igm-under-construction-icon" aria-hidden>
            <span className="igm-under-construction-cogs">
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-a" />
              <i className="bx bx-cog igm-under-construction-cog igm-under-construction-cog-b" />
            </span>
          </div>
          <p className="igm-under-construction-eyebrow">Inspection Générale des Mines</p>
          <h1 className="igm-under-construction-title">Page en construction</h1>
          <p className="igm-under-construction-lead">
            Cette section du site est en cours de préparation. Merci de votre patience.
          </p>
          <div className="igm-under-construction-actions">
            <Link href="/" className="igm-under-construction-btn igm-under-construction-btn-primary">
              Retour à l&apos;accueil
            </Link>
            <a href="tel:+243976844563" className="igm-under-construction-btn igm-under-construction-btn-ghost">
              Nous appeler
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path: segments = [] } = await params;

  if (!isPublishedHomePage(segments)) {
    return <UnderConstruction />;
  }

  const absoluteFilePath = resolvePublishedHomeAbsolutePath();
  if (!absoluteFilePath) {
    notFound();
  }

  let fullHtml: string;
  try {
    fullHtml = await readFile(absoluteFilePath, "utf8");
  } catch {
    notFound();
  }

  const bodyInnerHtml = extractBodyInnerHtml(fullHtml);
  if (!bodyInnerHtml) notFound();

  const stripped = stripNextRuntimeScripts(bodyInnerHtml);
  const noChrome = stripSharedChrome(stripped);
  const noScripts = stripAllScripts(noChrome);
  const stats = await getStats();
  const withStats = applyCmsStatsToHtml(rewriteUrls(noScripts), stats);
  const rewritten = prefixInjectedHtmlRootPaths(withStats);

  return <main dangerouslySetInnerHTML={{ __html: rewritten }} />;
}
