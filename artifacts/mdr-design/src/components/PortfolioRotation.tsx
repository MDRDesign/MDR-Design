import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { mediaUrl } from './Media';
import { useReducedMotion } from '@/lib/motion';
import { projectReferences, type ProjectReference } from '@/data/projectReferences';

const INTERVAL = 6000;

function Slide({ r, active }: { r: ProjectReference; active: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="rot-slide" data-active={active} aria-hidden={!active} data-testid={`slide-project-${r.slug}`}>
      {broken ? (
        <div className="rot-missing" data-testid={`status-image-unavailable-${r.slug}`}>
          <span className="label">Screenshot unavailable</span>
          <p className="serif text-2xl mt-3">{r.client}</p>
          <a href={r.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1} className="ulink label !text-[var(--fg)] mt-5">
            View the live site <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      ) : (
        <img src={mediaUrl(r.image)} alt={r.imageAlt} width={1440} height={900} className="frame-media" style={{ objectFit: 'cover', objectPosition: 'top' }}
          loading="lazy" decoding="async" onError={() => setBroken(true)} />
      )}
    </div>
  );
}

/** Rotates real screenshots of every published project, with metadata kept in sync. */
export function PortfolioRotation({ idPrefix = 'portfolio', heading }: { idPrefix?: string; heading?: string }) {
  const items = projectReferences;
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(typeof document !== 'undefined' && document.hidden);
  const running = !reduced && !userPaused && !hovered && !focused && !hidden;

  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setI((n) => (n + 1) % items.length), INTERVAL);
    return () => window.clearTimeout(t);
  }, [running, i, items.length]);

  const r = items[i];
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={heading ?? 'Studio projects'}
      className="grid12 gap-y-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}
      data-testid={`carousel-${idPrefix}`}
    >
      <div className="col-span-4 md:col-span-8">
        <div className="frame rot-frame aspect-[4/3] md:aspect-[16/10] border border-[var(--rule)]">
          {items.map((it, n) => <Slide key={it.slug} r={it} active={n === i} />)}
          {running && <span key={i} className="rot-progress" aria-hidden="true" />}
        </div>
        <p className="label muted mt-3" data-testid={`text-${idPrefix}-capture-note`}>
          {r.imageCaption ?? 'Published website — desktop screenshot'}
        </p>
      </div>
      <div className="col-span-4 md:col-span-3 md:col-start-10 flex flex-col justify-between gap-8">
        <div aria-live={running ? 'off' : 'polite'} aria-atomic="true" key={r.slug} className="rot-meta">
          <span className="label" data-testid={`text-${idPrefix}-number`}><span className="n">{r.number} / {String(items.length).padStart(2, '0')}</span>{r.year}</span>
          <p className="serif text-3xl leading-tight mt-8" data-testid={`text-${idPrefix}-client`}>{r.client}</p>
          <p className="muted mt-3 text-sm">{r.disciplines.join(' + ')}</p>
          <div className="mt-8 flex flex-col gap-4 items-start">
            {r.casePath && <Link href={r.casePath} className="btn" data-testid={`link-${idPrefix}-case`}>Read the case <span className="arrow">→</span></Link>}
            <a href={r.liveUrl} target="_blank" rel="noopener noreferrer" className="ulink label !text-[var(--fg)]" data-testid={`link-${idPrefix}-project-live`}>
              Visit live site <span aria-hidden="true">↗</span><span className="sr-only"> for {r.client} (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-6 label !text-[var(--fg)]">
          <button type="button" className="ulink" onClick={() => go(-1)} aria-label="Previous project" data-testid={`button-${idPrefix}-prev`}>← Prev</button>
          <button type="button" className="ulink" onClick={() => go(1)} aria-label="Next project" data-testid={`button-${idPrefix}-next`}>Next →</button>
          {!reduced && (
            <button type="button" className="hero-toggle ml-auto" data-paused={userPaused} aria-pressed={userPaused} onClick={() => setUserPaused((p) => !p)} data-testid={`button-${idPrefix}-pause`}>
              {userPaused ? 'Resume' : 'Pause'}<span className="sr-only"> project rotation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
