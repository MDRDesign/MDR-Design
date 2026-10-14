import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion';

const BASE = import.meta.env.BASE_URL;
export const mediaUrl = (p: string) => (/^https?:/.test(p) ? p : BASE + p.replace(/^\//, ''));

const cache = new Map<string, Promise<boolean>>();

/** HEAD-checks a file and confirms content-type (dev servers answer missing files with HTML). */
function probe(url: string, kind: 'video' | 'image') {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { method: 'HEAD' })
        .then((r) => r.ok && (r.headers.get('content-type') ?? '').startsWith(kind + '/'))
        .catch(() => false),
    );
  }
  return cache.get(url)!;
}

function useNear<T extends HTMLElement>(eager: boolean) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(eager);
  useEffect(() => {
    if (eager || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [eager]);
  return { ref, near };
}

type VideoProps = {
  src: string; // e.g. 'media/hero-loop.mp4'
  poster?: string;
  label: string;
  fallback: ReactNode;
  eager?: boolean;
  className?: string;
};

/** Plays a local video if present; otherwise shows designed fallback art. No broken requests rendered. */
export function SmartVideo({ src, poster, label, fallback, eager = false, className = '' }: VideoProps) {
  const reduced = useReducedMotion();
  const { ref, near } = useNear<HTMLDivElement>(eager);
  const [ok, setOk] = useState(false);
  const url = mediaUrl(src);
  useEffect(() => {
    if (!near) return;
    let live = true;
    probe(url, 'video').then((v) => live && setOk(v));
    return () => { live = false; };
  }, [near, url]);

  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      <div className="absolute inset-0" aria-hidden={ok ? true : undefined}>{fallback}</div>
      {ok && (
        <video
          className="frame-media"
          src={url}
          poster={poster ? mediaUrl(poster) : undefined}
          muted
          loop
          playsInline
          autoPlay={!reduced}
          controls={reduced}
          preload={eager ? 'auto' : 'metadata'}
          aria-label={label}
          onError={() => setOk(false)}
        />
      )}
    </div>
  );
}

export function SmartImage({ src, alt, fallback, className = '' }: { src: string; alt: string; fallback: ReactNode; className?: string }) {
  const { ref, near } = useNear<HTMLDivElement>(false);
  const [ok, setOk] = useState(false);
  const url = mediaUrl(src);
  useEffect(() => {
    if (!near) return;
    let live = true;
    probe(url, 'image').then((v) => live && setOk(v));
    return () => { live = false; };
  }, [near, url]);
  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      {!ok && <div className="absolute inset-0">{fallback}</div>}
      {ok && <img className="frame-media" src={url} alt={alt} loading="lazy" onError={() => setOk(false)} />}
    </div>
  );
}
