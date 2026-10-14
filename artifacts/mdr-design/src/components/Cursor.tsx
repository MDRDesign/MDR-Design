import { useEffect, useRef, useState } from 'react';

/**
 * Desktop-only ink dot. The native cursor stays visible (accessibility);
 * the dot expands to "View" over elements marked data-cursor="view".
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(fine.matches && !reduce.matches);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      el.classList.remove('is-hidden');
      const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor="view"]');
      el.classList.toggle('is-view', !!t);
    };
    const leave = () => el.classList.add('is-hidden');
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [enabled]);
  if (!enabled) return null;
  return <div ref={ref} className="ink-cursor is-hidden" aria-hidden="true">View</div>;
}
