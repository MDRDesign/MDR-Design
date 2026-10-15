import { useEffect, useRef, useState } from 'react';
import './_group.css';

function MovingMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mm-lockup ${small ? 'mm-small' : ''}`}>
      <div className="mm-mark" role="img" aria-label="Clean sans-serif interlocking MDR initials with a gently changing color and fine moving line pattern">
        <div className="mm-color" />
        <svg className="mm-pattern" viewBox="0 0 900 750" aria-hidden="true">
          <g>
            {Array.from({ length: 32 }, (_, i) => (
              <path key={i} d={`M ${i * 80 - 900} -600 L ${i * 80 - 420} 1200`} />
            ))}
          </g>
        </svg>
      </div>
      <p className="mm-name">MDR Design</p>
    </div>
  );
}

export function SoftMonogram() {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);
  const [near, setNear] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(preference.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => {
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <main ref={root} className="mdr-monogram-preview" data-running={!paused && !reduced && visible && near}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" />
      <header className="mm-header">
        <p className="mm-label">MDR Design <span>Identity study / Refined monogram</span></p>
        <h1>Clean. Distinct. MDR.</h1>
        <p className="mm-intro">Sans-serif initials. Clearer forms. The same restrained motion.</p>
      </header>

      <section className="mm-stage" aria-label="Animated logo preview">
        <MovingMark />
        <p className="mm-stage-note">Color and pattern move. The letterforms stay still.</p>
      </section>

      <div className="mm-controls">
        <span className="mm-status" aria-live="polite">
          {reduced ? 'Motion off · device preference' : paused ? 'Motion paused' : 'Ivory / soft coral / warm brass'}
        </span>
        <button type="button" className="mm-button" onClick={() => setPaused(value => !value)} disabled={reduced} aria-pressed={paused || reduced}>
          {reduced ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion'}
        </button>
      </div>

      <section className="mm-scale-study" aria-label="Logo at a smaller scale">
        <div>
          <p className="mm-label">Smaller footprint</p>
          <p className="mm-scale-copy">The name stays clear, even when the mark is compact.</p>
        </div>
        <div className="mm-mini-stage"><MovingMark small /></div>
      </section>
      <footer className="mm-footer">Concept for review · Homepage unchanged</footer>
    </main>
  );
}
