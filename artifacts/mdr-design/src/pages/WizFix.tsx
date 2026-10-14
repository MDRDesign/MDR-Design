import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { SmartImage, SmartVideo } from '@/components/Media';
import { ConceptTag, DeviceMockup, FilmPlaceholder, WizFixConcept } from '@/components/Art';
import { BeforeAfter } from '@/components/BeforeAfter';
import { getCase } from '@/data/cases';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

export default function WizFix() {
  useSeo(routeMeta['/work/wizfix'], '/work/wizfix');
  const c = getCase('wizfix')!;
  const approvedQuote = !c.quote.isSample && c.quote.text.trim().length > 0;
  const measuredResults = c.results.filter((r) => r.value != null && r.value.trim().length > 0);
  const facts = [
    ['Client', c.client],
    ['Location', c.location],
    ['Discipline', c.disciplines.join(' + ')],
    ['Year', c.year],
  ];

  return (
    <article>
      <Reveal as="header" immediate className="band band-blue wrap pt-36 md:pt-44 pb-20">
        <p className="label fade d1"><span className="n">Case {c.number}</span>Selected Work</p>
        <div className="grid12 mt-8 gap-y-8 items-end">
          <h1 className="col-span-4 md:col-span-9 mega !text-[clamp(2.8rem,6.5vw,7rem)]" data-testid="text-case-title">
            <Lines lines={['WizFix', <em key="c">Computers</em>]} start={0.15} delayStep={0.15} />
          </h1>
          <span aria-hidden="true" className="hidden md:block col-span-3 numeral text-[8rem] text-right">{c.number}</span>
        </div>
        <div className="hr hr-ink draw d3 mt-10" />
        <dl className="grid12 gap-y-6 pt-6">
          {facts.map(([k, v], i) => (
            <div key={k} className={`col-span-2 md:col-span-3 fade d${i + 2}`}>
              <dt className="label">{k}</dt>
              <dd className="mt-2 serif text-2xl" data-testid={`text-fact-${k.toLowerCase()}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid12 mt-10">
          <p className="col-span-4 md:col-span-6 text-lg leading-relaxed fade d5">{c.summary}</p>
          <div className="col-span-4 md:col-span-3 md:col-start-10 mt-8 md:mt-0 fade d6">
            <a href={c.liveUrl} target="_blank" rel="noopener noreferrer" className="btn w-full justify-between" data-testid="link-live-site">
              Visit live site <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ink wrap pad">
        <div className="frame wipe aspect-[4/3] md:aspect-[16/8] border border-[var(--rule)]" data-cursor="view">
          <SmartImage src="media/wizfix-mockup.jpg" alt="WizFix Computers website mockup" fallback={<WizFixConcept />} />
          <ConceptTag text="Concept visual" />
        </div>
        <p className="label mt-3">Fig. 01 — Homepage direction</p>
      </Reveal>

      {/* What Joey needed — approved testimonials are optional */}
      <Reveal as="section" className="band band-crimson wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="01" className="col-span-4 md:col-span-3">What Joey needed</Label>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <p className="title">
              <Lines lines={[c.needed.statement]} />
            </p>
            <p className="mt-8 text-lg max-w-2xl fade d3">{c.needed.supporting}</p>
            {approvedQuote && (
              <figure className="mt-8">
                <blockquote className="title">
                  <Lines lines={[<>“{c.quote.text}”</>]} />
                </blockquote>
                <figcaption className="mt-8 muted fade d3">— {c.quote.attribution}</figcaption>
              </figure>
            )}
          </div>
        </div>
      </Reveal>

      {/* What I heard */}
      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="02" className="col-span-4 md:col-span-3">What I heard</Label>
          <p className="col-span-4 md:col-span-7 md:col-start-5 serif text-[clamp(1.5rem,2.2vw,2rem)] leading-tight">
            <Lines lines={[c.heard.lead]} />
          </p>
        </div>
        <div className="grid12 mt-14 gap-y-12">
          {c.heard.points.map((p, i) => (
            <div key={p.title} className={`col-span-4 ${i === 0 ? 'md:col-start-5 md:col-span-4' : i === 1 ? 'md:col-span-4' : 'md:col-start-5 md:col-span-4'} relative pt-5 fade d${i + 2}`}>
              <div className="hr draw absolute top-0" />
              <p className="label"><span className="n">0{i + 1}</span></p>
              <h3 className="display text-3xl mt-3"><em>{p.title}</em></h3>
              <p className="mt-4 muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Before/after */}
      <Reveal as="section" className="band band-ink wrap pad">
        <div className="fade -mx-[var(--gutter)]"><BeforeAfter /></div>
      </Reveal>

      {/* What I built */}
      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="03" className="col-span-4 md:col-span-3">What I built</Label>
          <ol className="col-span-4 md:col-span-8 md:col-start-5">
            {c.built.map((b, i) => (
              <li key={b.title} className={`grid grid-cols-8 gap-4 py-7 border-t border-[var(--rule)] fade d${i + 1}`}>
                <span className="col-span-1 numeral text-3xl">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="col-span-7 md:col-span-3 serif text-2xl">{b.title}</h3>
                <p className="col-span-7 col-start-2 md:col-span-4 muted leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* Film */}
      <Reveal as="section" className="band band-ink wrap pad">
        <div className="frame wipe aspect-[16/10] md:aspect-[16/7] bg-[#0e0e0e]" data-cursor="view">
          <SmartVideo src="media/wizfix-film.mp4" label="WizFix walkthrough film" fallback={<FilmPlaceholder />} />
        </div>
        <p className="label mt-3">Fig. 03 — Walkthrough film</p>
      </Reveal>

      {/* Device */}
      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="grid12 gap-y-6 items-end">
          <div className="col-span-4 md:col-span-8">
            <div className="frame wipe aspect-[16/10] border border-[var(--rule)]" data-cursor="view">
              <DeviceMockup />
              <ConceptTag />
            </div>
            <p className="label mt-3">Fig. 04 — Across devices</p>
          </div>
          <p className="col-span-4 md:col-span-3 md:col-start-10 serif text-xl leading-snug fade d3">
            Most customers meet the shop on a phone, in a hurry, with something broken. <em>It had to work there first.</em>
          </p>
        </div>
      </Reveal>

      {/* Results */}
      {measuredResults.length > 0 && (
      <Reveal as="section" className="band band-ink wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="04" className="col-span-4 md:col-span-3">Results</Label>
          <div className="col-span-4 md:col-span-9 md:col-start-5 grid grid-cols-1 md:grid-cols-3 border-t border-[var(--fg)]">
            {measuredResults.map((r, i) => (
              <div key={r.label} className={`py-8 md:pr-6 border-b md:border-b-0 border-[var(--rule)] ${i > 0 ? 'md:border-l md:pl-6' : ''}`} data-testid={`text-result-${i}`}>
                <p className="label">{r.label}</p>
                <p className="numeral text-6xl mt-4">{r.value ?? '—'}</p>
                <p className="mt-3 text-sm muted">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
      )}

      <Reveal as="section" className="band band-ink wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-10 gap-y-8 items-end">
          <p className="col-span-4 md:col-span-8 title">
            <Lines lines={[<>Your shop could be <em>next.</em></>]} />
          </p>
          <div className="col-span-4 md:col-span-3 md:col-start-10 flex flex-col gap-4 fade d3">
            <Link href="/contact" className="btn btn-solid justify-between" data-testid="link-case-contact">Let’s talk <span className="arrow">→</span></Link>
            <Link href="/#work" className="ulink self-start text-sm">Back to work</Link>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
