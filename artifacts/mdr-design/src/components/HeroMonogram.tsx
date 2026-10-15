import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '@/lib/motion';
import standardLockup from '../../../../branding/mdr-design/homepage/d-foreground/mdr-design-lockup-on-dark.svg?url';
import compactLockup from '../../../../branding/mdr-design/homepage/d-foreground/mdr-design-lockup-small-on-dark.svg?url';
import './HeroMonogram.css';

/** Preserve the approved silhouette while cycling its edge and inset separately. */
export function HeroMonogram({ paused }: { paused: boolean }) {
  const insetFilter = `identity-inset-${useId().replace(/:/g, '')}`;
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
      <svg width="0" height="0" aria-hidden="true" className="hero-identity-filters">
        <defs>
          <filter id={insetFilter} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceGraphic" operator="erode" radius=".65" />
          </filter>
        </defs>
      </svg>
      {!failed ? (
        <div className="hero-identity-mark" role="img" aria-label="MDR Design — Layered Monoline monogram" style={{ '--identity-standard': `url("${standardLockup}")`, '--identity-compact': `url("${compactLockup}")` } as CSSProperties}>
          <img src={standardLockup} width={600} height={450} alt="" aria-hidden="true" className="hero-identity-standard" fetchPriority="high" onError={() => setFailed(true)} />
          <img src={compactLockup} width={176} height={132} alt="" aria-hidden="true" className="hero-identity-compact" fetchPriority="high" onError={() => setFailed(true)} />
          <div className="hero-identity-motion" aria-hidden="true">
            <div className="hero-identity-edge" />
            <div className="hero-identity-inset" style={{ filter: `url("#${insetFilter}")` }}>
              <div className="hero-identity-interior">
                <div className="hero-identity-color" />
                <svg className="hero-identity-pattern" viewBox="0 0 900 675">
                  <g>
                    {Array.from({ length: 32 }, (_, i) => (
                      <path key={i} d={`M ${i * 80 - 900} -600 L ${i * 80 - 420} 1200`} />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="hero-identity-error" role="status">Studio mark unavailable</p>
      )}
    </div>
  );
}
