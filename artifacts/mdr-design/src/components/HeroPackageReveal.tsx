import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { mediaUrl } from '@/components/Media';
import { useReducedMotion } from '@/lib/motion';
import './HeroPackageReveal.css';

const APP_URL = 'https://captainsgalley.org/';

type Phase = 'packaged' | 'opening' | 'tablet';

/**
 * Hero: a wrapped parcel unties, folds its flaps back and opens its side
 * panels to reveal a tablet showing real Captain's Galley screenshots.
 * All motion is CSS keyframes started once by a class, so the hero's
 * `.hero-paused` ancestor pauses/resumes it without restarting.
 * Phase is advanced from animationend events (also pause-safe).
 * Optional `textureSrc` (relative to public/) skins the wrapping paper.
 */
export function HeroPackageReveal({ textureSrc = 'media/mdr-wrapping-paper.webp' }: { textureSrc?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>('packaged');

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

  const onAnimEnd = (e: AnimationEvent<HTMLDivElement>) => {
    const n = e.animationName;
    if (n === 'hpr-ribbon-off') setPhase((p) => (p === 'packaged' ? 'opening' : p));
    if (n === 'hpr-tablet-in') setPhase('tablet');
  };

  const style = textureSrc ? ({ '--hpr-texture': `url("${mediaUrl(textureSrc)}")` } as CSSProperties) : undefined;
  const state = reduced ? 'static' : started ? 'playing' : 'idle';

  return (
    <div
      ref={ref}
      className="hpr"
      data-reveal={state}
      data-phase={phase}
      style={style}
      onAnimationEnd={onAnimEnd}
      data-testid="hero-package-reveal"
    >
      <div className="hpr-stage">
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hpr-tablet"
          data-testid="link-hero-app"
        >
          <span className="sr-only">Open the Captain&rsquo;s Galley ordering web app, built by MDR Design (captainsgalley.org, opens in a new tab)</span>
          <span className="hpr-bezel" aria-hidden="true">
            <span className="hpr-cam" />
            <span className="hpr-screen">
              <img className="hpr-shot hpr-shot-home" src={mediaUrl('media/captains-galley-mobile-home.webp')} alt="" width={565} height={1048} decoding="async" />
              <img className="hpr-shot hpr-shot-menu" src={mediaUrl('media/captains-galley-mobile-menu.webp')} alt="" width={565} height={1050} decoding="async" />
              <span className="hpr-glare" />
            </span>
          </span>
          <span className="hpr-id" aria-hidden="true">
            <span className="hpr-id-name">Captain&rsquo;s Galley</span>
            <span className="hpr-id-url"><span className="hpr-id-long">captainsgalley.org</span><span className="hpr-id-short">Open app</span> <span className="hpr-id-arr">↗</span></span>
          </span>
        </a>

        {/* The parcel: decorative, wraps the tablet then opens away */}
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
