import type { Plugin } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { previews } from "./src/data/previews";

const pages: Record<string, [string, string]> = {
  "/": ["MDR Design — Web Design & Brand Identity", "Websites and brands for local businesses that deserve to look established. Danielle Crowder listens first, then designs a presence worth noticing."],
  "/work/wizfix": ["WizFix Computers — A Brand Story | MDR Design", "A web design and brand direction concept for WizFix Computers in Diamond Bar, CA. What Joey said, what Danielle heard, and what she built."],
  "/process": ["Listen. Shape. Launch. — The Process | MDR Design", "From the first conversation to a considered launch. Explore Danielle Crowder’s approach to building websites and brands around your business."],
  "/services": ["Web Design & Branding Services | MDR Design", "Brand Starter, Website, or Brand + Website. Thoughtful design for local businesses ready for an established, credible presence. Start a conversation."],
  "/contact": ["Tell Me About Your Business | MDR Design", "Have a business worth noticing? Share your goals with Danielle Crowder at MDR Design and start a conversation about your website and brand."],
  "/preview/wizfix": ["Prepared for Joey — WizFix Computers | MDR Design", "A considered web design and branding concept prepared for Joey and WizFix Computers by Danielle Crowder."],
};
for (const preview of previews) {
  pages[`/preview/${preview.slug}`] = [
    `Prepared for ${preview.clientName} — ${preview.businessName} | MDR Design`,
    `A considered web design and branding concept prepared for ${preview.clientName} and ${preview.businessName} by Danielle Crowder.`,
  ];
}
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function head(html: string, route: string, siteUrl?: string): string {
  const preview = route.startsWith("/preview/");
  const [title, description] = pages[route] ?? (preview ? ["A concept prepared for you | MDR Design", "A personal design concept from Danielle Crowder at MDR Design."] : pages["/"]!);
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s[^>]*(?:name|property)=["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, "")
    .replace(/<link\s[^>]*rel=["']canonical["'][^>]*>/gi, "");
  const base = siteUrl?.replace(/\/$/, "");
  const image = `${base ?? ""}/media/og-image.png`;
  const tags = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${preview ? "noindex, nofollow" : "index, follow"}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:image" content="${escape(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(image)}">`,
    ...(base ? [`<meta property="og:url" content="${escape(base + route)}">`, `<link rel="canonical" href="${escape(base + route)}">`] : []),
  ].join("\n");
  return html.replace("</head>", `${tags}\n</head>`);
}

/** Crawlers receive metadata without needing to execute the React application. */
export function editorialSeo(): Plugin {
  let output = "";
  const siteUrl = process.env.VITE_SITE_URL;
  return {
    name: "mdr-editorial-seo",
    configResolved(config) { output = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const route = (ctx.originalUrl ?? ctx.path).split("?")[0]!.replace(/\/$/, "") || "/";
        return head(html, route, siteUrl);
      },
    },
    async closeBundle() {
      const shell = await readFile(path.join(output, "index.html"), "utf8");
      // Static route shells retain the same React entry while exposing route-specific metadata.
      for (const route of Object.keys(pages).filter((r) => r !== "/")) {
        const destination = path.join(output, route, "index.html");
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, head(shell, route, siteUrl));
      }
      if (siteUrl) {
        const base = siteUrl.replace(/\/$/, "");
        const urls = Object.keys(pages).filter((r) => !r.startsWith("/preview/"));
        await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((r) => `<url><loc>${escape(base + r)}</loc></url>`).join("")}</urlset>`);
        await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /preview/\nSitemap: ${base}/sitemap.xml\n`);
      }
    },
  };
}
