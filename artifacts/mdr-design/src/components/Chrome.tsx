import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Thin crimson scroll progress — transform only, rAF-throttled. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return <div ref={ref} className="progress" aria-hidden="true" />;
}

/** Ink wipe on route change. 0.6s, never blocks input, content stays mounted. */
export function RouteWipe() {
  const [loc] = useLocation();
  const first = useRef(true);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduced()) return;
    setKey((k) => k + 1);
    const t = window.setTimeout(() => setKey(0), 650);
    return () => window.clearTimeout(t);
  }, [loc]);
  return key ? <div key={key} className="route-wipe" aria-hidden="true" /> : null;
}

/** First-visit-per-session intro: 1.35s total, hard-removed at 1.4s. */
export function Intro() {
  const [show, setShow] = useState(() => {
    try {
      if (reduced() || sessionStorage.getItem('mdr-intro')) return false;
      sessionStorage.setItem('mdr-intro', '1');
      return true;
    } catch { return false; }
  });
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(false), 1400);
    return () => window.clearTimeout(t);
  }, [show]);
  return show ? <div className="intro" aria-hidden="true"><span>MDR</span></div> : null;
}
