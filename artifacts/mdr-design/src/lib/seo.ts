import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, seoUrl, type RouteMeta } from '@/data/routeMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function useSeo(meta: RouteMeta, path: string) {
  useEffect(() => {
    const url = seoUrl(path, import.meta.env.BASE_URL, SITE_URL);
    const image = seoUrl(meta.image ?? DEFAULT_OG_IMAGE, import.meta.env.BASE_URL, SITE_URL);
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', meta.imageAlt ?? 'MDR Design — web design and brand identity');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setMeta('name', 'twitter:image', image);
    setMeta('name', 'twitter:image:alt', meta.imageAlt ?? 'MDR Design — web design and brand identity');
    setMeta('name', 'twitter:card', 'summary_large_image');
    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (meta.noindex || !SITE_URL) {
      canon?.remove();
    } else {
      if (!canon) {
        canon = document.createElement('link');
        canon.rel = 'canonical';
        document.head.appendChild(canon);
      }
      canon.href = url;
    }
  }, [meta.title, meta.description, meta.noindex, meta.image, meta.imageAlt, path]);
}
