import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { heroFilm } from '@/data/heroFilm';

/** Native silent video: no playback offscreen, in hidden tabs, or while paused. */
export function HeroStreetFilm({ paused }: { paused: boolean }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [manualPlay, setManualPlay] = useState(false);
  const [loadRequested, setLoadRequested] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    observer.observe(element);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const allowed = !paused && visible && tabVisible && (!reduced || manualPlay) && !failed;

  useEffect(() => {
    if (allowed) setLoadRequested(true);
  }, [allowed]);

  useEffect(() => {
    if (loadRequested) video.current?.load();
  }, [loadRequested]);

  useEffect(() => {
    let current = true;
    const player = video.current;
    if (!player || !loadRequested) return;
    if (allowed) {
      player.play().catch(() => {
        if (current) setNeedsPlay(true);
      });
    } else {
      player.pause();
    }
    return () => { current = false; player.pause(); };
  }, [allowed, loadRequested]);

  // A newly enabled reduced-motion preference immediately returns to a still.
  useEffect(() => {
    if (reduced) { setManualPlay(false); setShowPoster(true); }
  }, [reduced]);

  const playFromButton = () => {
    setManualPlay(true);
    setLoadRequested(true);
    const player = video.current;
    if (player) {
      player.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
    }
  };

  return (
    <div ref={root} className="relative w-full h-full bg-[var(--ink)] overflow-hidden" data-testid="hero-street-film">
      <img
        src={heroFilm.poster}
        alt="A city pedestrian smiling at his phone in the MDR Design street film."
        width={720}
        height={1280}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <video
        ref={video}
        poster={heroFilm.poster}
        muted
        playsInline
        loop={!reduced}
        preload="none"
        aria-label={heroFilm.description}
        className={`absolute inset-0 w-full h-full object-cover ${showPoster || failed ? 'invisible' : ''}`}
        onPlaying={() => { setShowPoster(false); setNeedsPlay(false); }}
        onEnded={() => { if (reduced) { setManualPlay(false); setShowPoster(true); } }}
        onError={() => { setFailed(true); setShowPoster(true); }}
        data-testid="video-hero-film"
      >
        {loadRequested && (
          <>
            <source src={heroFilm.webm} type="video/webm" />
            <source src={heroFilm.video} type="video/mp4" />
          </>
        )}
      </video>
      {((reduced && !manualPlay) || needsPlay) && !failed && !paused && (
        <button type="button" onClick={playFromButton} className="absolute bottom-5 left-5 z-[3] btn !text-sm" aria-label="Play the MDR Design street film" data-testid="button-play-hero-film">
          Play film <span className="arrow" aria-hidden="true">→</span>
        </button>
      )}
      {reduced && manualPlay && (
        <button type="button" onClick={() => { setManualPlay(false); setShowPoster(true); }} className="absolute bottom-5 left-5 z-[3] btn !text-sm" data-testid="button-pause-hero-film">Pause film</button>
      )}
      {failed && <p role="status" className="absolute bottom-0 inset-x-0 bg-[var(--ink)] text-[var(--ivory)] text-xs p-3">Film unavailable — still image shown.</p>}
      <p className="sr-only">{heroFilm.description}</p>
    </div>
  );
}
