import { useEffect } from 'react';
import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { SmartVideo } from '@/components/Media';
import { HeroArt, WizFixConcept, ConceptTag } from '@/components/Art';
import { cases } from '@/data/cases';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const approach = [
  { n: '01', t: 'Listen', b: 'We start with a conversation, not a questionnaire. What you’re proud of, what customers misunderstand, what keeps you up. Most of the brand is already in the room.' },
  { n: '02', t: 'Shape', b: 'I turn what I heard into a visual direction — type, color, words, structure — and show you why each choice serves your customer.' },
  { n: '03', t: 'Launch', b: 'A finished brand and site, built properly, handed over with care. You walk away looking like the business you already are.' },
];

export default function Home() {
  useSeo(routeMeta['/'], '/');
  useEffect(() => {
    if (window.location.hash === '#work') setTimeout(() => document.getElementById('work')?.scrollIntoView(), 50);
  }, []);
  const wiz = cases[0];

  return (
    <>
      {/* HERO */}
      <Reveal as="section" immediate className="wrap relative min-h-[100dvh] pt-32 md:pt-36 pb-10 flex flex-col">
        <div className="grid12 flex-1 gap-y-10">
          <div className="col-span-4 md:col-span-7 flex flex-col justify-between">
            <p className="label fade d1" data-testid="text-hero-label"><span className="n">MDR Design</span>— Web Design & Brand Identity</p>
            <h1 className="display text-[clamp(3.2rem,8.4vw,9.25rem)] mt-10 md:mt-0">
              <Lines lines={['Your business,', <><em>finally</em> looking</>, 'like it means it.']} start={0.2} delayStep={0.14} />
            </h1>
            <div className="grid grid-cols-7 mt-10 md:mt-0">
              <div className="col-span-7 md:col-span-4 md:col-start-1">
                <div className="hr hr-ink draw d4 mb-5" />
                <p className="text-lg md:text-xl leading-snug fade d5" data-testid="text-hero-promise">
                  Websites and brands for local businesses that deserve to look established.
                </p>
                <div className="mt-8 flex flex-wrap gap-6 items-center fade d6">
                  <Link href="/contact" className="btn" data-testid="link-hero-contact">Start a conversation <span className="arrow">→</span></Link>
                  <Link href="/work/wizfix" className="ulink text-sm" data-testid="link-hero-work">See the work</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 md:col-span-4 md:col-start-9 flex flex-col">
            <div className="frame wipe d3 flex-1 min-h-[55vh] md:min-h-0 border border-[var(--rule)]">
              <SmartVideo eager src="media/hero-loop.mp4" poster="media/og-image.png" label="Studio film loop" fallback={<HeroArt />} />
            </div>
            <div className="mt-3 flex justify-between label fade d5">
              <span>Pl. 01</span><span>Diamond Bar → Everywhere</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* SELECTED WORK */}
      <Reveal as="section" id="work" className="wrap pt-24 md:pt-40 scroll-mt-10">
        <div className="grid12 items-end gap-y-6">
          <Label n="I." className="col-span-4 md:col-span-3">Selected Work</Label>
          <h2 className="col-span-4 md:col-span-7 md:col-start-5 display text-[clamp(2.4rem,5vw,4.8rem)]">
            <Lines lines={[<>One shop, <em>seen properly</em></>, 'for the first time.']} />
          </h2>
        </div>
        <div className="hr draw mt-10" />
        <Link href="/work/wizfix" className="group block mt-10" data-testid="link-case-wizfix">
          <div className="grid12 gap-y-6">
            <div className="col-span-4 md:col-span-9">
              <div className="frame frame-zoom wipe aspect-[4/3] md:aspect-[16/9] border border-[var(--rule)]" data-cursor="view">
                <WizFixConcept />
              </div>
              <div className="relative"><ConceptTag text="Concept visual" /></div>
            </div>
            <div className="col-span-4 md:col-span-3 flex md:flex-col justify-between">
              <span className="numeral text-[clamp(6rem,14vw,13rem)]">{wiz.number}</span>
              <div className="fade d3 text-right md:text-left">
                <p className="serif text-3xl">{wiz.client}</p>
                <p className="muted mt-2 text-sm">{wiz.disciplines.join(' + ')} — {wiz.location}</p>
                <p className="mt-6 text-sm ulink">Read the case <span className="arrow">→</span></p>
              </div>
            </div>
          </div>
        </Link>

        {/* Index list */}
        <div className="mt-24" role="table" aria-label="Project index">
          <div role="row" className="grid12 label pb-3 border-b border-[var(--fg)]">
            <span role="columnheader" className="col-span-1 md:col-span-1">No.</span>
            <span role="columnheader" className="col-span-3 md:col-span-5">Client</span>
            <span role="columnheader" className="hidden md:block md:col-span-4">Discipline</span>
            <span role="columnheader" className="hidden md:block md:col-span-2 text-right">Year</span>
          </div>
          {cases.map((c) => (
            <Link key={c.slug} href={`/work/${c.slug}`} role="row" className="idx-row grid12 py-6 border-b border-[var(--rule)] items-baseline" data-testid={`row-case-${c.slug}`}>
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
      </Reveal>

      {/* APPROACH */}
      <Reveal as="section" className="wrap pt-32 md:pt-48">
        <div className="grid12 gap-y-6">
          <Label n="II." className="col-span-4 md:col-span-3">Approach</Label>
          <p className="col-span-4 md:col-span-6 md:col-start-5 serif text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">
            <Lines lines={[<>The best brief is the one you <em>say out loud.</em></>]} />
          </p>
        </div>
        <ol className="mt-16 grid12 gap-y-14">
          {approach.map((a, i) => (
            <li key={a.n} className={`col-span-4 md:col-span-4 relative pt-6 fade d${i + 2}`}>
              <div className="hr hr-ink draw absolute top-0" />
              <span className="numeral text-[clamp(5rem,9vw,8rem)] block">{a.n}</span>
              <h3 className="display text-5xl mt-4">{i === 0 ? <em>{a.t}</em> : a.t}</h3>
              <p className="mt-5 muted leading-relaxed max-w-sm">{a.b}</p>
            </li>
          ))}
        </ol>
        <Link href="/process" className="ulink inline-block mt-14 text-sm" data-testid="link-process">The full process <span className="arrow">→</span></Link>
      </Reveal>

      {/* MANIFESTO */}
      <Reveal as="section" className="wrap pt-32 md:pt-48">
        <div className="grid12">
          <Label n="III." className="col-span-4 md:col-span-2">Belief</Label>
          <blockquote className="col-span-4 md:col-span-9 md:col-start-4 display text-[clamp(2.2rem,5.2vw,5.4rem)] leading-[1.02] mt-6 md:mt-0">
            <Lines delayStep={0.09} lines={[
              'Good local businesses',
              <>are often <em>better</em> than they look.</>,
              'I close that gap — quietly,',
              <>carefully, and <em className="accent">for good.</em></>,
            ]} />
          </blockquote>
          <p className="col-span-4 md:col-span-4 md:col-start-9 mt-12 muted fade d4">— Danielle Crowder, MDR Design</p>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="wrap pt-32 md:pt-48">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-12 gap-y-10 items-end">
          <h2 className="col-span-4 md:col-span-9 display text-[clamp(3rem,8vw,8.5rem)]">
            <Lines lines={['Have a business', <>worth <em>noticing?</em></>]} />
          </h2>
          <div className="col-span-4 md:col-span-3 fade d3">
            <Link href="/contact" className="btn btn-solid w-full justify-between" data-testid="link-cta-contact">Let’s talk <span className="arrow">→</span></Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
