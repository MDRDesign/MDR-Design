/**
 * Route metadata — used client-side by useSeo, and exportable for a
 * server-side HTML transform (social previews).
 */
import { previews } from './previews';

export type RouteMeta = { title: string; description: string; noindex?: boolean; image?: string; imageAlt?: string };

export const SITE_NAME = 'MDR Design';
export const DEFAULT_OG_IMAGE = '/media/og-image.png';

export const routeMeta: Record<string, RouteMeta> = {
  '/': {
    title: 'MDR Design — Web Design & Brand Identity for Local Businesses',
    description: 'Websites and brands for local businesses that deserve to look established. D.C. listens first, then builds the presence you’ve earned.',
  },
  '/work/wizfix': {
    title: 'WizFix Computers — Case Study · MDR Design',
    description: 'Web design and brand direction for a Diamond Bar, CA computer repair, IT and printing shop: clarity, trust and discoverability.',
    image: '/media/og-wizfix.jpg',
    imageAlt: 'WizFix Computers case study — published computer repair website, by MDR Design.',
  },
  '/work/armada-catering': {
    title: 'Armada-Catering — Case Study · MDR Design',
    description: 'Web design and brand direction for a small Southern California catering company seeking a fresh identity and a clearer presence for introductions and referrals.',
    image: '/media/og-armada-catering.jpg',
    imageAlt: 'Armada-Catering case study — published catering website, by MDR Design.',
  },
  '/process': {
    title: 'Process — Listen, Shape, Launch · MDR Design',
    description: 'From first conversation to launch day: how MDR Design turns what you say into a brand and website that work.',
  },
  '/services': {
    title: 'Services — Brand Starter, Website, Brand + Website · MDR Design',
    description: 'Three ways to work together. Brand identity, websites, or both — built for local businesses.',
  },
  '/contact': {
    title: 'Contact — Let’s talk · MDR Design',
    description: 'Have a business worth noticing? Tell D.C. about it.',
  },
  '/preview/:slug': {
    title: 'A concept, prepared for you · MDR Design',
    description: 'An unlisted concept preview from MDR Design.',
    noindex: true,
  },
};

for (const preview of previews) {
  routeMeta[`/preview/${preview.slug}`] = {
    ...routeMeta['/preview/:slug'],
    title: `Prepared for ${preview.clientName} — ${preview.businessName} · MDR Design`,
  };
}

/** Paths here are artifact-relative; the configured site URL is an origin, not a base path. */
export function seoUrl(path: string, basePath: string, siteUrl = ''): string {
  const base = `/${basePath.replace(/^\/|\/$/g, '')}`.replace(/\/$/, '');
  return `${siteUrl.replace(/\/$/, '')}${base}/${path.replace(/^\//, '')}`;
}

export function metaForPath(path: string): RouteMeta {
  if (routeMeta[path]) return routeMeta[path];
  if (path.startsWith('/preview/')) return routeMeta['/preview/:slug'];
  return { title: `Not found · ${SITE_NAME}`, description: routeMeta['/'].description, noindex: true };
}
