import type { Plugin } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_OG_IMAGE, SITE_NAME, metaForPath, routeMeta, seoUrl } from "./src/data/routeMeta";

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function seoHead(html: string, route: string, basePath: string, siteUrl = ""): string {
  const meta = metaForPath(route);
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s[^>]*(?:name|property)=["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, "")
    .replace(/<link\s[^>]*rel=["']canonical["'][^>]*>/gi, "");
  const image = seoUrl(meta.image ?? DEFAULT_OG_IMAGE, basePath, siteUrl);
  const url = seoUrl(route, basePath, siteUrl);
  const alt = meta.imageAlt ?? "MDR Design — web design and brand identity";
  const tags = [
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}">`,
    `<meta name="robots" content="${meta.noindex ? "noindex, nofollow" : "index, follow"}">`,
    `<meta property="og:title" content="${escape(meta.title)}">`,
    `<meta property="og:description" content="${escape(meta.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escape(SITE_NAME)}">`,
    `<meta property="og:image" content="${escape(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escape(alt)}">`,
    `<meta property="og:url" content="${escape(url)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(meta.title)}">`,
    `<meta name="twitter:description" content="${escape(meta.description)}">`,
    `<meta name="twitter:image" content="${escape(image)}">`,
    `<meta name="twitter:image:alt" content="${escape(alt)}">`,
    ...(siteUrl && !meta.noindex ? [`<link rel="canonical" href="${escape(url)}">`] : []),
  ].join("\n");
  return html.replace("</head>", `${tags}\n</head>`);
}

/** Crawlers receive metadata without needing to execute the React application. */
export function editorialSeo(): Plugin {
  let output = "";
  let basePath = "/";
  let siteUrl = "";
  const routes = Object.keys(routeMeta).filter((r) => !r.includes(":"));
  return {
    name: "mdr-editorial-seo",
    configResolved(config) {
      output = path.resolve(config.root, config.build.outDir);
      basePath = config.base;
      siteUrl = config.env.VITE_SITE_URL ?? process.env.VITE_SITE_URL ?? "";
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        let route = (ctx.originalUrl ?? ctx.path).split("?")[0]!;
        const prefix = basePath.replace(/\/$/, "");
        if (prefix && (route === prefix || route.startsWith(prefix + "/"))) route = route.slice(prefix.length);
        route = route.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
        return seoHead(html, route, basePath, siteUrl);
      },
    },
    async closeBundle() {
      const shell = await readFile(path.join(output, "index.html"), "utf8");
      // Static route shells retain the React entry while exposing route-specific metadata.
      for (const route of routes.filter((r) => r !== "/")) {
        const destination = path.join(output, route, "index.html");
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, seoHead(shell, route, basePath, siteUrl));
      }
      // Unknown preview slugs must not fall through to the indexable home shell.
      await mkdir(path.join(output, "preview"), { recursive: true });
      await writeFile(path.join(output, "preview/index.html"), seoHead(shell, "/preview/:slug", basePath, siteUrl));
      if (siteUrl) {
        const urls = routes.filter((r) => !routeMeta[r].noindex);
        await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((r) => `<url><loc>${escape(seoUrl(r, basePath, siteUrl))}</loc></url>`).join("")}</urlset>`);
        await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: ${basePath}\nDisallow: ${seoUrl("/preview/", basePath)}\nSitemap: ${seoUrl("/sitemap.xml", basePath, siteUrl)}\n`);
      }
    },
  };
}
