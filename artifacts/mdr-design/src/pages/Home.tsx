import { useEffect, type ReactNode } from 'react';
import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { SmartVideo } from '@/components/Media';
import { HeroArt } from '@/components/Art';
import { WizFixScreenshot } from '@/components/WizFixMedia';
import { getCase } from '@/data/cases';
import { projectReferences } from '@/data/projectReferences';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const approach = [
  { n: '01', t: 'Listen', b: 'We start with a conversation, not a questionnaire. What you’re proud of, what customers misunderstand, what keeps you up. Most of the brand is already in the room.' },
  { n: '02', t: 'Shape', b: 'I turn what I heard into a visual direction — type, color, words, structure — and show you why each choice serves your customer.' },
  { n: '03', t: 'Launch', b: 'A finished brand and site, built properly, handed over with care. You walk away looking like the business you already are.' },
];

const heroLines: ReactNode[] = ['Your business,', <><em>finally</em> looking</>, 'like it means it.'];

export default function Home() {
  useSeo(routeMeta['/'], '/');
  useEffect(() => {
    if (window.location.hash === '#work') setTimeout(() => document.getElementById('work')?.scrollIntoView(), 50);
  }, []);
  const wiz = getCase('wizfix')!;

  return (
    <>
      {/* HERO */}
      <Reveal as="section" immediate className="band band-blue pt-28 md:pt-32 pb-14 md:pb-20">
        <div className="wrap">
          <div className="grid12 gap-y-12 items-end">
            <div className="col-span-4 md:col-span-7 flex flex-col">
              <p className="label fade d1" data-testid="text-hero-label"><span className="n">MDR Design</span>— Web Design & Brand Identity</p>
              <h1 className="mega mt-8 md:mt-10">
                <Lines lines={heroLines} start={0.2} delayStep={0.14} />
              </h1>
              <div className="mt-10 grid grid-cols-7 gap-6">
                <div className="col-span-7 md:col-span-5">
                  <div className="hr hr-ink draw d4 mb-6" />
                  <p className="text-lg leading-relaxed fade d5" data-testid="text-hero-promise">
                    Websites and brands for local businesses that deserve to look established.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-8 items-center fade d6">
                    <Link href="/contact" className="btn" data-testid="link-hero-contact">Start a conversation <span className="arrow">→</span></Link>
                    <Link href="/work/wizfix" className="ulink label !text-[var(--fg)]" data-testid="link-hero-work">See the work</Link>
                  </div>
                </div>
              </div>
            </div>
            <figure className="col-span-4 md:col-span-5 px-3 md:px-0">
              <div className="relative aspect-[4/5]">
                <span className="crop tl" aria-hidden="true" /><span className="crop tr" aria-hidden="true" /><span className="crop bl" aria-hidden="true" /><span className="crop br" aria-hidden="true" />
                <div className="frame frame-fill wipe d3">
                  <SmartVideo eager src="media/hero-loop.mp4" poster="media/mdr-structure.webp" label="Studio film loop" fallback={<HeroArt />} />
                </div>
              </div>
              <figcaption className="mt-4 flex justify-between label"><span>Pl. 01</span><span>Local brands, seen properly</span></figcaption>
            </figure>
          </div>
        </div>
      </Reveal>

      {/* SELECTED WORK */}
      <Reveal as="section" id="work" className="band band-ink pad scroll-mt-0">
        <div className="wrap">
          <div className="grid12 items-end gap-y-6">
            <Label n="I." className="col-span-4 md:col-span-3">Selected Work</Label>
            <h2 className="col-span-4 md:col-span-8 md:col-start-5 title">
              <Lines lines={[<>One shop, <em>seen properly</em></>, 'for the first time.']} />
            </h2>
          </div>
          <div className="hr draw mt-12" />
          <div className="grid12 gap-y-8 mt-12">
            <Link href="/work/wizfix" className="group col-span-4 md:col-span-8 block" data-testid="link-case-wizfix">
              <div className="frame frame-zoom wipe aspect-[4/3] md:aspect-[16/10]">
                <WizFixScreenshot />
              </div>
            </Link>
            <div className="col-span-4 md:col-span-3 md:col-start-10 flex flex-col justify-between gap-8 fade d3">
              <span className="label"><span className="n">{wiz.number}</span>{wiz.year}</span>
              <div>
                <p className="serif text-3xl leading-tight">{wiz.client}</p>
                <p className="muted mt-3 text-sm">{wiz.disciplines.join(' + ')} — {wiz.location}</p>
                <div className="mt-8 flex flex-col gap-4 items-start">
                  <Link href="/work/wizfix" className="btn" data-testid="link-read-case">Read the case <span className="arrow">→</span></Link>
                  <a href={wiz.liveUrl} target="_blank" rel="noopener noreferrer" className="ulink label !text-[var(--fg)]" data-testid="link-home-wizfix-live">Visit live site <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
                </div>
              </div>
            </div>
          </div>

          {/* Index */}
          <div className="mt-16" role="table" aria-label="Project index">
            <div role="row" className="grid12 label pb-3 border-b border-[var(--fg)]">
              <span role="columnheader" className="col-span-1">No.</span>
              <span role="columnheader" className="col-span-3 md:col-span-4">Client</span>
              <span role="columnheader" className="hidden md:block md:col-span-3">Discipline</span>
              <span role="columnheader" className="hidden md:block md:col-span-1">Year</span>
              <span role="columnheader" className="hidden md:block md:col-span-3 text-right">Links</span>
            </div>
            {projectReferences.map((r) => (
              <div key={r.slug} role="row" className="grid12 py-6 border-b border-[var(--rule)] items-baseline gap-y-3" data-testid={`row-case-${r.slug}`}>
                <span role="cell" className="col-span-1 label !text-[var(--fg)]">{r.number}</span>
                <span role="cell" className="col-span-3 md:col-span-4 serif text-xl md:text-2xl">
                  {r.client}
                  <span className="mt-1 block font-sans text-xs muted md:hidden">{r.disciplines.join(' + ')}</span>
                  {r.milestone && <span className="mt-2 block font-sans text-xs muted">{r.milestone}<span className="md:hidden"> · {r.year}</span></span>}
                  {!r.milestone && r.year && <span className="mt-2 block font-sans text-xs muted md:hidden">{r.year}</span>}
                </span>
                <span role="cell" className="hidden md:block md:col-span-3 muted text-sm">{r.disciplines.join(' + ')}</span>
                <span role="cell" className="hidden md:block md:col-span-1 text-sm tabular-nums">{r.year ?? <span aria-label="Year not listed">—</span>}</span>
                <span role="cell" className="col-span-3 col-start-2 md:col-span-3 flex gap-6 md:justify-end label !text-[var(--fg)]">
                  {r.casePath && <Link href={r.casePath} className="ulink" data-testid={`link-index-case-${r.slug}`}>Case study <span className="arrow">→</span></Link>}
                  <a href={r.liveUrl} target="_blank" rel="noopener noreferrer" className="ulink" data-testid={`link-index-live-${r.slug}`}>Website <span aria-hidden="true">↗</span><span className="sr-only"> for {r.client} (opens in a new tab)</span></a>
                </span>
              </div>
            ))}
            <div className="grid12 py-6 border-b border-[var(--rule)] items-baseline muted">
              <span className="col-span-1 label">03</span>
              <span className="col-span-3 md:col-span-11 serif text-xl md:text-2xl italic">Your business — the next entry.</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* APPROACH */}
      <Reveal as="section" className="band band-ivory pad">
        <div className="wrap">
        <div className="grid12 gap-y-6">
          <Label n="II." className="col-span-4 md:col-span-3">Approach</Label>
          <p className="col-span-4 md:col-span-8 md:col-start-5 title">
            <Lines lines={[<>The best brief is the one you <em>say out loud.</em></>]} />
          </p>
        </div>
        <ol className="mt-12 grid12 gap-y-10">
          {approach.map((a, i) => (
            <li key={a.n} className={`col-span-4 md:col-span-4 relative pt-6 fade d${i + 2}`}>
              <div className="hr hr-ink draw absolute top-0" />
              <span className="label !text-[var(--fg)] block">{a.n}</span>
              <h3 className="display text-3xl md:text-4xl mt-6">{i === 0 ? <em>{a.t}</em> : a.t}</h3>
              <p className="mt-5 muted leading-relaxed max-w-sm">{a.b}</p>
            </li>
          ))}
        </ol>
        <Link href="/process" className="ulink label !text-[var(--fg)] inline-block mt-10" data-testid="link-process">The full process <span className="arrow">→</span></Link>
        </div>
      </Reveal>

      {/* MANIFESTO */}
      <Reveal as="section" className="band band-crimson pad">
        <div className="wrap">
        <div className="grid12">
          <Label n="III." className="col-span-4 md:col-span-3">Belief</Label>
          <blockquote className="col-span-4 md:col-span-8 md:col-start-5 title mt-6 md:mt-0">
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
          <h2 className="col-span-4 md:col-span-8 title">
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
