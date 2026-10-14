import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { SmartVideo } from '@/components/Media';
import { HeroArt, WizFixConcept, ConceptTag } from '@/components/Art';
import { KineticBand } from '@/components/KineticBand';
import { cases } from '@/data/cases';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const approach = [
  { n: '01', t: 'Listen', b: 'We start with a conversation, not a questionnaire. What you’re proud of, what customers misunderstand, what keeps you up. Most of the brand is already in the room.' },
  { n: '02', t: 'Shape', b: 'I turn what I heard into a visual direction — type, color, words, structure — and show you why each choice serves your customer.' },
  { n: '03', t: 'Launch', b: 'A finished brand and site, built properly, handed over with care. You walk away looking like the business you already are.' },
];

const heroLines: ReactNode[] = ['Your business,', <><em>finally</em> looking</>, 'like it means it.'];

/** Clips the difference-blend copy of the headline to the frame rectangle (desktop only). */
function useBlendClip(wrap: RefObject<HTMLDivElement | null>, frame: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const w = wrap.current, f = frame.current;
    if (!w || !f) return;
    const calc = () => {
      const a = w.getBoundingClientRect(), b = f.getBoundingClientRect();
      w.style.setProperty('--ct', `${Math.max(0, b.top - a.top)}px`);
      w.style.setProperty('--cl', `${Math.max(0, b.left - a.left)}px`);
      w.style.setProperty('--cr', `${Math.max(0, a.right - b.right)}px`);
      w.style.setProperty('--cb', `${Math.max(0, a.bottom - b.bottom)}px`);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(w); ro.observe(f);
    return () => ro.disconnect();
  }, [wrap, frame]);
}

/** Scroll-driven unmask/scale/parallax via a CSS variable — no React state. */
function useScrollVar(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [ref]);
}

/** Cursor-following concept thumbnail over the index (fine pointer only). */
function useThumbFollow(zone: RefObject<HTMLDivElement | null>, thumb: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const z = zone.current, t = thumb.current;
    if (!z || !t) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, active = false;
    const loop = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      t.style.transform = `translate3d(${cx + 24}px, ${cy - 105}px, 0)`;
      raf = active || Math.abs(x - cx) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      const over = !!(e.target as HTMLElement).closest('[data-thumb]');
      if (over && !active) { cx = x; cy = y; }
      active = over;
      t.classList.toggle('on', over);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => { active = false; t.classList.remove('on'); };
    z.addEventListener('pointermove', move);
    z.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); z.removeEventListener('pointermove', move); z.removeEventListener('pointerleave', leave); };
  }, [zone, thumb]);
}

export default function Home() {
  useSeo(routeMeta['/'], '/');
  useEffect(() => {
    if (window.location.hash === '#work') setTimeout(() => document.getElementById('work')?.scrollIntoView(), 50);
  }, []);
  const wiz = cases[0];
  const heroWrap = useRef<HTMLDivElement>(null);
  const heroFrame = useRef<HTMLDivElement>(null);
  const feat = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  useBlendClip(heroWrap, heroFrame);
  useScrollVar(feat);
  useThumbFollow(zone, thumb);

  return (
    <>
      {/* HERO */}
      <Reveal as="section" immediate className="band band-blue relative min-h-[100dvh] pt-28 md:pt-32 pb-10">
        <div ref={heroWrap} className="wrap relative">
          <p className="label fade d1" data-testid="text-hero-label"><span className="n">MDR Design</span>— Web Design & Brand Identity</p>
          <div className="relative mt-8 md:mt-10 md:min-h-[calc(20vw+84vh)]">
            <div className="hero-frame hidden md:block md:absolute md:right-0 md:top-[20vw] md:w-[32%] z-0">
              <div ref={heroFrame} className="relative h-[78vh]">
                <span className="crop tl" aria-hidden="true" /><span className="crop tr" aria-hidden="true" /><span className="crop bl" aria-hidden="true" /><span className="crop br" aria-hidden="true" />
                <div className="frame wipe d3 absolute inset-0">
                  <SmartVideo eager src="media/hero-loop.mp4" poster="media/og-image.png" label="Studio film loop" fallback={<HeroArt />} />
                </div>
              </div>
              <div className="mt-4 flex justify-between label"><span>Pl. 01 · Fig. 01</span><span>Local brands, seen properly</span></div>
            </div>
            <div className="relative z-10">
              <h1 className="mega">
                <Lines lines={heroLines} start={0.2} delayStep={0.14} />
              </h1>
              <div className="hero-blend" aria-hidden="true">
                <p className="mega"><Lines lines={heroLines} start={0.2} delayStep={0.14} /></p>
              </div>
            </div>
            <div className="relative z-10 grid12 mt-10 md:mt-14 gap-y-10">
              <div className="col-span-4 md:col-span-5">
                <div className="hr hr-ink draw d4 mb-5" />
                <p className="text-xl md:text-2xl leading-snug fade d5" data-testid="text-hero-promise">
                  Websites and brands for local businesses that deserve to look established.
                </p>
                <div className="mt-8 flex flex-wrap gap-6 items-center fade d6">
                  <Link href="/contact" className="btn" data-testid="link-hero-contact">Start a conversation <span className="arrow">→</span></Link>
                  <Link href="/work/wizfix" className="ulink label !text-[var(--fg)]" data-testid="link-hero-work">See the work</Link>
                </div>
              </div>
            </div>
            {/* mobile frame: stacked, no blend */}
            <div className="md:hidden relative mt-12 mx-3">
              <span className="crop tl" aria-hidden="true" /><span className="crop tr" aria-hidden="true" /><span className="crop bl" aria-hidden="true" /><span className="crop br" aria-hidden="true" />
              <div className="frame wipe d3 h-[62vh]"><HeroArt /></div>
            </div>
          </div>
          <div className="md:hidden mt-6 mx-3 flex justify-between label">
            <span>Pl. 01 · Fig. 01</span><span>Local brands, seen properly</span>
          </div>
        </div>
      </Reveal>

      <KineticBand />

      {/* SELECTED WORK */}
      <Reveal as="section" id="work" className="band band-ink pad scroll-mt-0">
        <span className="edge-num" aria-hidden="true">I.</span>
        <div className="wrap">
        <div className="grid12 items-end gap-y-6">
          <Label n="I." className="col-span-4 md:col-span-3">Selected Work</Label>
          <h2 className="col-span-4 md:col-span-9 md:col-start-4 title">
            <Lines lines={[<>One shop, <em>seen properly</em></>, 'for the first time.']} />
          </h2>
        </div>
        <div className="hr draw mt-10" />
        <Link href="/work/wizfix" className="group block mt-10" data-testid="link-case-wizfix">
          <div className="grid12 gap-y-6">
            <div className="col-span-4 md:col-span-9">
              <div ref={feat} className="feat frame aspect-[4/3] md:aspect-[16/9]" data-cursor="view">
                <div className="feat-inner"><WizFixConcept /></div>
              </div>
              <div className="relative"><ConceptTag text="Concept visual" /></div>
            </div>
            <div className="col-span-4 md:col-span-3 flex md:flex-col justify-between">
              <span className="numeral text-[clamp(6rem,14vw,13rem)]">{wiz.number}</span>
              <div className="fade d3 text-right md:text-left">
                <p className="serif text-4xl">{wiz.client}</p>
                <p className="muted mt-2 text-base">{wiz.disciplines.join(' + ')} — {wiz.location}</p>
                <p className="mt-6 text-sm ulink">Read the case <span className="arrow">→</span></p>
              </div>
            </div>
          </div>
        </Link>

        {/* Index list */}
        <div ref={zone} className="mt-24" role="table" aria-label="Project index">
          <div role="row" className="grid12 label pb-3 border-b border-[var(--fg)]">
            <span role="columnheader" className="col-span-1 md:col-span-1">No.</span>
            <span role="columnheader" className="col-span-3 md:col-span-5">Client</span>
            <span role="columnheader" className="hidden md:block md:col-span-4">Discipline</span>
            <span role="columnheader" className="hidden md:block md:col-span-2 text-right">Year</span>
          </div>
          {cases.map((c) => (
            <Link key={c.slug} href={`/work/${c.slug}`} role="row" data-thumb className="idx-row grid12 py-6 border-b border-[var(--rule)] items-baseline" data-testid={`row-case-${c.slug}`}>
              <span role="cell" className="col-span-1 numeral text-2xl !text-[var(--fg)]">{c.number}</span>
              <span role="cell" className="col-span-3 md:col-span-5 serif text-2xl md:text-3xl">{c.client} <span className="idx-arrow inline-block">→</span></span>
              <span role="cell" className="hidden md:block md:col-span-4 muted text-sm">{c.disciplines.join(' + ')}</span>
              <span role="cell" className="hidden md:block md:col-span-2 text-right text-sm tabular-nums">{c.year}</span>
            </Link>
          ))}
          <div className="grid12 py-6 border-b border-[var(--rule)] items-baseline muted">
            <span className="col-span-1 numeral text-2xl">02</span>
            <span className="col-span-3 md:col-span-11 serif text-2xl md:text-3xl italic">Your business — the next entry.</span>
          </div>
        </div>
        </div>
        <div ref={thumb} className="thumb-follow" aria-hidden="true"><WizFixConcept /></div>
      </Reveal>

      {/* APPROACH */}
      <Reveal as="section" className="band band-ivory pad">
        <span className="edge-num" aria-hidden="true">II.</span>
        <div className="wrap">
        <div className="grid12 gap-y-6">
          <Label n="II." className="col-span-4 md:col-span-3">Approach</Label>
          <p className="col-span-4 md:col-span-9 md:col-start-4 title">
            <Lines lines={[<>The best brief is the one you <em>say out loud.</em></>]} />
          </p>
        </div>
        <ol className="mt-16 grid12 gap-y-14">
          {approach.map((a, i) => (
            <li key={a.n} className={`col-span-4 md:col-span-4 relative pt-6 fade d${i + 2}`}>
              <div className="hr hr-ink draw absolute top-0" />
              <span className="numeral text-[clamp(5rem,9vw,8rem)] block">{a.n}</span>
              <h3 className="display text-6xl md:text-7xl mt-4">{i === 0 ? <em>{a.t}</em> : a.t}</h3>
              <p className="mt-5 muted text-lg leading-relaxed max-w-sm">{a.b}</p>
            </li>
          ))}
        </ol>
        <Link href="/process" className="btn mt-14" data-testid="link-process">The full process <span className="arrow">→</span></Link>
        </div>
      </Reveal>

      {/* MANIFESTO */}
      <Reveal as="section" className="band band-crimson pad">
        <span className="edge-num" aria-hidden="true">III.</span>
        <div className="wrap">
        <div className="grid12">
          <Label n="III." className="col-span-4 md:col-span-2">Belief</Label>
          <blockquote className="col-span-4 md:col-span-9 md:col-start-4 title mt-6 md:mt-0">
            <Lines delayStep={0.09} lines={[
              'Good local businesses',
              <>are often <em>better</em> than they look.</>,
              'I close that gap — quietly,',
              <>carefully, and <em>for good.</em></>,
            ]} />
          </blockquote>
          <p className="col-span-4 md:col-span-4 md:col-start-9 mt-12 muted fade d4">— Danielle Crowder, MDR Design</p>
        </div>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="band band-blue pad">
        <div className="wrap">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-12 gap-y-10 items-end">
          <h2 className="col-span-4 md:col-span-9 mega !text-[clamp(3.4rem,12vw,14rem)]">
            <Lines lines={['Have a business', <>worth <em>noticing?</em></>]} />
          </h2>
          <div className="col-span-4 md:col-span-3 fade d3">
            <Link href="/contact" className="btn btn-solid w-full justify-between" data-testid="link-cta-contact">Let’s talk <span className="arrow">→</span></Link>
          </div>
        </div>
        </div>
      </Reveal>
    </>
  );
}
