import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '@/lib/motion';
import './HeroMonogram.css';

const markUrl = `${import.meta.env.BASE_URL}api/studio-media/mdr-monogram-facf157e68d7.webp`;

/** Approved provisional identity; only the fill and fine internal lines move. */
export function HeroMonogram({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    const updateVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return (
    <div ref={root} className="hero-identity" data-running={!paused && !reduced && inView && tabVisible} data-testid="hero-monogram">
      <img src={markUrl} width={613} height={290} alt="" aria-hidden="true" className="sr-only" fetchPriority="high" onError={() => setFailed(true)} />
      {!failed ? (
        <div className="hero-identity-mark" role="img" aria-label="Interlocking MDR monogram" style={{ '--identity-mask': `url("${markUrl}")` } as CSSProperties}>
          <div className="hero-identity-color" />
          <svg className="hero-identity-pattern" viewBox="0 0 900 426" aria-hidden="true">
            <g>
              {Array.from({ length: 32 }, (_, i) => (
                <path key={i} d={`M ${i * 80 - 900} -600 L ${i * 80 - 420} 1200`} />
              ))}
            </g>
          </svg>
        </div>
      ) : (
        <p className="hero-identity-error" role="status">Studio mark unavailable</p>
      )}
      <p className="hero-identity-name">MDR Design</p>
    </div>
  );
}
