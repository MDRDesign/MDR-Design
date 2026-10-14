import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { mediaUrl } from '@/components/Media';
import { useReducedMotion } from '@/lib/motion';
import './HeroDraftingReveal.css';

type Phase = 'framed' | 'opening' | 'tablet';
type ProjectId = 'galley' | 'wizfix';

const PROJECTS: Record<ProjectId, { name: string; host: string; url: string; label: string }> = {
  galley: { name: 'Captain\u2019s Galley', host: 'captainsgalley.org', url: 'https://captainsgalley.org/', label: 'Open the Captain\u2019s Galley ordering web app, built by MDR Design (captainsgalley.org, opens in a new tab)' },
  wizfix: { name: 'WizFix Computers', host: 'wizfix computers', url: 'https://wiz-fix-computers-website.replit.app/', label: 'Open the WizFix Computers website, built by MDR Design (opens in a new tab)' },
};

/**
 * Hero: a layered drafting frame (mineral-jade leaves over graphite plates)
 * slides apart on fixed tracks, leaving rails and brackets around a tablet that to reveal a tablet that
 * shows real Captain's Galley and WizFix Computers screens.
 * All motion is CSS keyframes; project changes are driven by animationend
 * (no timers), so `.hero-paused` and reduced motion freeze everything.
 */
export function HeroDraftingReveal({ textureSrc = 'media/mdr-mineral-wrap.webp', metalSrc = 'media/mdr-drafting-graphite.webp' }: { textureSrc?: string; metalSrc?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>('framed');
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
    if (n === 'hdr-slide-l') setPhase((p) => (p === 'framed' ? 'opening' : p));
    if (n === 'hdr-tablet-in') setPhase('tablet');
    if (n === 'hdr-menu') show('wizfix');
    if (n === 'hdr-wiz') show('galley');
  };

  const style = { '--hdr-texture': `url("${mediaUrl(textureSrc)}")`, '--hdr-metal': `url("${mediaUrl(metalSrc)}")` } as CSSProperties;
  const state = reduced ? 'static' : started ? 'playing' : 'idle';
  const cur = PROJECTS[project];

  return (
    <div
      ref={ref}
      className="hdr"
      data-reveal={state}
      data-phase={phase}
      data-project={project}
      data-cycled={cycle > 0}
      style={style}
      onAnimationEnd={onAnimEnd}
      data-testid="hero-drafting-reveal"
    >
      <div className="hdr-stage">
        <div className="hdr-wrap">
          <div className="hdr-pick" role="group" aria-label="Choose project shown on tablet">
            {(Object.keys(PROJECTS) as ProjectId[]).map((id, i) => (
              <button key={id} type="button" aria-pressed={project === id} onClick={() => show(id)} data-testid={`button-hero-project-${id}`}>
                {String(i + 1).padStart(2, '0')}<span className="sr-only"> {PROJECTS[id].name}</span>
              </button>
            ))}
          </div>
          <a href={cur.url} target="_blank" rel="noopener noreferrer" className="hdr-tablet" data-testid="link-hero-app" data-project={project}>
            <span className="sr-only">{cur.label}</span>
            <span className="hdr-bezel" aria-hidden="true">
              <span className="hdr-cam" />
              <span className="hdr-screen">
                <span key={project === 'galley' ? `g${cycle}` : 'g'} className="hdr-proj hdr-proj-galley" data-active={project === 'galley'}>
                  <img className="hdr-shot hdr-shot-home" src={mediaUrl('media/captains-galley-mobile-home.webp')} alt="" width={565} height={1048} decoding="async" />
                  <img className="hdr-shot hdr-shot-menu" src={mediaUrl('media/captains-galley-mobile-menu.webp')} alt="" width={565} height={1050} decoding="async" />
                </span>
                <span key={project === 'wizfix' ? `w${cycle}` : 'w'} className="hdr-proj hdr-proj-wizfix" data-active={project === 'wizfix'}>
                  <img className="hdr-shot hdr-shot-wiz" src={mediaUrl('media/wizfix-mobile.webp')} alt="" width={390} height={844} decoding="async" loading="lazy" />
                </span>
                <span className="hdr-glare" />
              </span>
            </span>
            <span className="hdr-id" aria-hidden="true" data-testid="text-hero-project">
              <span className="hdr-id-name">{cur.name}</span>
              <span className="hdr-id-url"><span className="hdr-id-long">{project === 'galley' ? cur.host : 'Visit site'}</span><span className="hdr-id-short">Open</span> <span className="hdr-id-arr">↗</span></span>
            </span>
          </a>
        </div>

        {/* Drafting frame: fixed rails + sliding layered panels (decorative) */}
        <div className="hdr-rig" aria-hidden="true">
          <span className="hdr-rail hdr-rail-t"><i /></span>
          <span className="hdr-rail hdr-rail-b"><i /></span>
          <span className="hdr-brk hdr-brk-tl" /><span className="hdr-brk hdr-brk-tr" /><span className="hdr-brk hdr-brk-bl" /><span className="hdr-brk hdr-brk-br" />
          <span className="hdr-plate hdr-plate-t" />
          <span className="hdr-plate hdr-plate-b" />
          <span className="hdr-leaf hdr-leaf-l"><i /></span>
          <span className="hdr-leaf hdr-leaf-r"><i /></span>
        </div>
      </div>
    </div>
  );
}
