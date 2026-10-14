import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { mediaUrl } from '@/components/Media';
import { getCase } from '@/data/cases';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';
import NotFound from './not-found';

export default function Armada() {
  useSeo(routeMeta['/work/armada-catering'], '/work/armada-catering');
  const c = getCase('armada-catering');
  if (!c) return <NotFound />;
  const approvedQuote = !c.quote.isSample && c.quote.text.trim().length > 0;
  const measuredResults = c.results.filter((r) => r.value != null && r.value.trim().length > 0);
  const facts: [string, string][] = [
    ['Client', c.client],
    ['Location', c.location],
    ['Discipline', c.disciplines.join(' + ')],
    ['Year', c.milestone ? `${c.year} — ${c.milestone}` : c.year],
  ];

  return (
    <article>
      <Reveal as="header" immediate className="band band-blue wrap pt-28 md:pt-32 pb-14 md:pb-16">
        <p className="label fade d1"><span className="n">Case {c.number}</span>Selected Work</p>
        <h1 className="mega mt-8 max-w-[16ch]" data-testid="text-case-title">
          <Lines lines={['Armada', <em key="c">Catering</em>]} start={0.15} delayStep={0.15} />
        </h1>
        <div className="hr hr-ink draw d3 mt-10" />
        <dl className="grid12 gap-y-6 pt-6">
          {facts.map(([k, v], i) => (
            <div key={k} className={`col-span-2 md:col-span-3 fade d${i + 2}`}>
              <dt className="label">{k}</dt>
              <dd className="mt-2 serif text-xl md:text-2xl" data-testid={`text-fact-${k.toLowerCase()}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid12 mt-10 gap-y-8">
          <p className="col-span-4 md:col-span-6 text-lg leading-relaxed fade d5" data-testid="text-case-summary">{c.summary}</p>
          <div className="col-span-4 md:col-span-3 md:col-start-10 fade d6">
            <a href={c.liveUrl} target="_blank" rel="noopener noreferrer" className="btn w-full justify-between" data-testid="link-live-site">
              Visit live site <span className="arrow" aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Reveal>

      {/* Published website proof */}
      <Reveal as="section" className="band band-ink wrap pad">
        <figure>
          <a href={c.liveUrl} target="_blank" rel="noopener noreferrer" className="block group" data-testid="link-armada-screenshot">
            <div className="frame frame-zoom wipe aspect-[16/9]">
              <img
                src={mediaUrl('media/armada-desktop.webp')}
                alt="Armada-Catering published homepage on desktop: dark coastal tones, warm ivory serif headline and a Plan Your Event invitation"
                className="frame-media"
                width={1440}
                height={810}
                loading="lazy"
                decoding="async"
                data-testid="img-armada-desktop"
              />
            </div>
            <span className="sr-only"> — opens the live Armada-Catering website in a new tab</span>
          </a>
          <figcaption className="mt-4 flex flex-wrap justify-between gap-3 label">
            <span>Fig. 01 — Published website, desktop</span>
            <span>{new URL(c.liveUrl).hostname}</span>
          </figcaption>
        </figure>
      </Reveal>

      {/* What Armada needed */}
      <Reveal as="section" className="band band-crimson wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="01" className="col-span-4 md:col-span-3">What Armada needed</Label>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <p className="title"><Lines lines={[c.needed.statement]} /></p>
            <p className="mt-8 text-lg max-w-2xl fade d3">{c.needed.supporting}</p>
            {approvedQuote && (
              <figure className="mt-10">
                <blockquote className="serif text-2xl md:text-3xl leading-snug">“{c.quote.text}”</blockquote>
                <figcaption className="mt-6 muted">— {c.quote.attribution}</figcaption>
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
        <div className="grid12 mt-12 gap-y-10">
          {c.heard.points.map((p, i) => (
            <div key={p.title} className={`col-span-4 ${i === 0 ? 'md:col-start-5' : ''} md:col-span-4 relative pt-5 fade d${i + 2}`}>
              <div className="hr draw absolute top-0" />
              <p className="label"><span className="n">0{i + 1}</span></p>
              <h3 className="display text-3xl mt-3"><em>{p.title}</em></h3>
              <p className="mt-4 muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* What I built */}
      <Reveal as="section" className="band band-ink wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="03" className="col-span-4 md:col-span-3">What I built</Label>
          <ol className="col-span-4 md:col-span-8 md:col-start-5">
            {c.built.map((b, i) => (
              <li key={b.title} className={`grid grid-cols-8 gap-4 py-7 border-t border-[var(--rule)] fade d${i + 1}`}>
                <span className="col-span-1 label !text-[var(--fg)]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="col-span-7 md:col-span-3 serif text-2xl">{b.title}</h3>
                <p className="col-span-7 col-start-2 md:col-span-4 muted leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* Results — only once real, measured data exists */}
      {measuredResults.length > 0 && (
        <Reveal as="section" className="band band-ivory wrap pad">
          <div className="grid12 gap-y-6">
            <Label n="04" className="col-span-4 md:col-span-3">Results</Label>
            <div className="col-span-4 md:col-span-8 md:col-start-5 grid grid-cols-1 md:grid-cols-2 border-t border-[var(--fg)]">
              {measuredResults.map((r, i) => (
                <div key={r.label} className={`py-8 md:pr-6 border-b md:border-b-0 border-[var(--rule)] ${i > 0 ? 'md:border-l md:pl-6' : ''}`} data-testid={`text-result-${i}`}>
                  <p className="label">{r.label}</p>
                  <p className="display text-5xl mt-4">{r.value}</p>
                  <p className="mt-3 text-sm muted">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Next step */}
      <Reveal as="section" className="band band-blue wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-10 gap-y-8 items-end">
          <p className="col-span-4 md:col-span-7 title">
            <Lines lines={[<>Planning a fresh <em>direction?</em></>]} />
          </p>
          <div className="col-span-4 md:col-span-4 md:col-start-9 flex flex-col gap-5 fade d3">
            <Link href={`/contact?need=${encodeURIComponent('Brand + Website')}`} className="btn btn-solid justify-between" data-testid="link-case-contact">
              Let’s talk <span className="arrow">→</span>
            </Link>
            <div className="flex flex-wrap gap-x-8 gap-y-3 label !text-[var(--fg)]">
              <Link href="/work/wizfix" className="ulink" data-testid="link-next-case-wizfix">Next case: WizFix <span className="arrow">→</span></Link>
              <Link href="/#work" className="ulink" data-testid="link-back-work">Back to work</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
