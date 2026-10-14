import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { mediaUrl } from '@/components/Media';
import { useReducedMotion } from '@/lib/motion';
import './HeroPackageReveal.css';

type Phase = 'packaged' | 'opening' | 'tablet';
type ProjectId = 'galley' | 'wizfix';

const PROJECTS: Record<ProjectId, { name: string; host: string; url: string; label: string }> = {
  galley: { name: 'Captain\u2019s Galley', host: 'captainsgalley.org', url: 'https://captainsgalley.org/', label: 'Open the Captain\u2019s Galley ordering web app, built by MDR Design (captainsgalley.org, opens in a new tab)' },
  wizfix: { name: 'WizFix Computers', host: 'wizfix computers', url: 'https://wiz-fix-computers-website.replit.app/', label: 'Open the WizFix Computers website, built by MDR Design (opens in a new tab)' },
};

/**
 * Hero: a mineral-wrapped parcel unties and opens to reveal a tablet that
 * alternates real Captain's Galley and WizFix Computers screens.
 * All motion is CSS keyframes; project changes are driven by animationend
 * (no timers), so `.hero-paused` and reduced motion freeze everything.
 */
export function HeroPackageReveal({ textureSrc = 'media/mdr-mineral-wrap.webp' }: { textureSrc?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>('packaged');
  const [project, setProject] = useState<ProjectId>('galley');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) { setStarted(true); setPhase('tablet'); return; }
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.35) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const show = (p: ProjectId) => { setProject(p); setCycle((c) => c + 1); };

  const onAnimEnd = (e: AnimationEvent<HTMLDivElement>) => {
    const n = e.animationName;
    if (n === 'hpr-ribbon-off') setPhase((p) => (p === 'packaged' ? 'opening' : p));
    if (n === 'hpr-tablet-in') setPhase('tablet');
    if (n === 'hpr-menu') show('wizfix');
    if (n === 'hpr-wiz') show('galley');
  };

  const style = textureSrc ? ({ '--hpr-texture': `url("${mediaUrl(textureSrc)}")` } as CSSProperties) : undefined;
  const state = reduced ? 'static' : started ? 'playing' : 'idle';
  const cur = PROJECTS[project];

  return (
    <div
      ref={ref}
      className="hpr"
      data-reveal={state}
      data-phase={phase}
      data-project={project}
      data-cycled={cycle > 0}
      style={style}
      onAnimationEnd={onAnimEnd}
      data-testid="hero-package-reveal"
    >
      <div className="hpr-stage">
        <div className="hpr-wrap">
          <div className="hpr-pick" role="group" aria-label="Choose project shown on tablet">
            {(Object.keys(PROJECTS) as ProjectId[]).map((id, i) => (
              <button key={id} type="button" aria-pressed={project === id} onClick={() => show(id)} data-testid={`button-hero-project-${id}`}>
                {String(i + 1).padStart(2, '0')}<span className="sr-only"> {PROJECTS[id].name}</span>
              </button>
            ))}
          </div>
          <a href={cur.url} target="_blank" rel="noopener noreferrer" className="hpr-tablet" data-testid="link-hero-app" data-project={project}>
            <span className="sr-only">{cur.label}</span>
            <span className="hpr-bezel" aria-hidden="true">
              <span className="hpr-cam" />
              <span className="hpr-screen">
                <span key={project === 'galley' ? `g${cycle}` : 'g'} className="hpr-proj hpr-proj-galley" data-active={project === 'galley'}>
                  <img className="hpr-shot hpr-shot-home" src={mediaUrl('media/captains-galley-mobile-home.webp')} alt="" width={565} height={1048} decoding="async" />
                  <img className="hpr-shot hpr-shot-menu" src={mediaUrl('media/captains-galley-mobile-menu.webp')} alt="" width={565} height={1050} decoding="async" />
                </span>
                <span key={project === 'wizfix' ? `w${cycle}` : 'w'} className="hpr-proj hpr-proj-wizfix" data-active={project === 'wizfix'}>
                  <img className="hpr-shot hpr-shot-wiz" src={mediaUrl('media/wizfix-mobile.webp')} alt="" width={390} height={844} decoding="async" loading="lazy" />
                </span>
                <span className="hpr-glare" />
              </span>
            </span>
            <span className="hpr-id" aria-hidden="true" data-testid="text-hero-project">
              <span className="hpr-id-name">{cur.name}</span>
              <span className="hpr-id-url"><span className="hpr-id-long">{project === 'galley' ? cur.host : 'Visit site'}</span><span className="hpr-id-short">Open</span> <span className="hpr-id-arr">↗</span></span>
            </span>
          </a>
        </div>

        <div className="hpr-pack" aria-hidden="true">
          <span className="hpr-flap hpr-flap-l"><i /></span>
          <span className="hpr-flap hpr-flap-r"><i /></span>
          <span className="hpr-flap hpr-flap-t"><i /></span>
          <span className="hpr-flap hpr-flap-b"><i /></span>
          <span className="hpr-ribbon hpr-ribbon-v" />
          <span className="hpr-ribbon hpr-ribbon-h" />
          <span className="hpr-tag">MDR / Pl. 01</span>
        </div>
      </div>
    </div>
  );
}
