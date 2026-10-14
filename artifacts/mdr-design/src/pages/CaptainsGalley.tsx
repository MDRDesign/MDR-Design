import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { mediaUrl } from '@/components/Media';
import { projectReferences } from '@/data/projectReferences';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';
import NotFound from './not-found';

const steps: { title: string; body: string }[] = [
  { title: 'Browse the menu', body: 'The published homepage offers both a Menu link and a View Menu action, giving visitors a clear place to start.' },
  { title: 'Order ahead', body: 'Menu cards pair food photography, descriptions and prices with a direct Add to Order action, turning browsing into the start of an order.' },
  { title: 'Pick up', body: 'Pickup completes the workflow. The homepage explains the intended use plainly: order ahead and pick up when you’re ready.' },
];

const screens = [
  {
    file: 'media/captains-galley-mobile-home.webp',
    height: 1048,
    caption: 'Fig. 01 — Homepage, the ordering entry point',
    alt: 'Captain’s Galley mobile homepage introducing local meals for pickup with a View Menu button',
  },
  {
    file: 'media/captains-galley-mobile-menu.webp',
    height: 1050,
    caption: 'Fig. 02 — Menu, from browsing to Add to Order',
    alt: 'Captain’s Galley mobile menu showing a breakfast burrito, its description and price, and an Add to Order button',
  },
];

export default function CaptainsGalley() {
  useSeo(routeMeta['/work/captains-galley'], '/work/captains-galley');
  const p = projectReferences.find((r) => r.slug === 'captains-galley');
  if (!p) return <NotFound />;
  const host = new URL(p.liveUrl).hostname;
  const facts: [string, string][] = [
    ['Client', p.client],
    ['Format', 'Web app'],
    ['Discipline', p.disciplines.join(' + ')],
    ['Year', p.year ?? ''],
  ];

  return (
    <article>
      <Reveal as="header" immediate className="band band-blue wrap pt-28 md:pt-32 pb-14 md:pb-16">
        <p className="label fade d1"><span className="n">Project {p.number}</span>Web App</p>
        <h1 className="mega mt-8 max-w-[16ch]" data-testid="text-case-title">
          <Lines lines={['Captain’s', <em key="g">Galley</em>]} start={0.15} delayStep={0.15} />
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
          <p className="col-span-4 md:col-span-6 text-lg leading-relaxed fade d5" data-testid="text-case-summary">{p.description}</p>
          <div className="col-span-4 md:col-span-3 md:col-start-10 fade d6">
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn w-full justify-between" data-testid="link-live-app">
              Visit live app <span className="arrow" aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ink wrap pad">
        <div className="grid sm:grid-cols-2 gap-10 md:gap-16 max-w-5xl mx-auto">
          {screens.map((screen, i) => (
            <figure key={screen.file} className={`fade d${i + 1}`}>
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="block max-w-[420px] mx-auto border border-[var(--rule)] wipe overflow-hidden frame-zoom" data-testid={`link-galley-screenshot-${i}`}>
                <img
                  src={mediaUrl(screen.file)}
                  alt={screen.alt}
                  className="block w-full h-auto"
                  width={565}
                  height={screen.height}
                  loading="lazy"
                  decoding="async"
                  data-testid={`img-galley-mobile-${i}`}
                />
                <span className="sr-only"> — opens the live Captain’s Galley web app in a new tab</span>
              </a>
              <figcaption className="mt-4 label">{screen.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 flex flex-wrap justify-between gap-3 label">
          <span>Owner-provided mobile screenshots</span>
          <span>{host}</span>
        </p>
      </Reveal>

      <Reveal as="section" className="band band-crimson wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="01" className="col-span-4 md:col-span-3">The business need</Label>
          <div className="col-span-4 md:col-span-8 md:col-start-5">
            <p className="title"><Lines lines={[<>Finding the food and ordering it should be <em>one move.</em></>]} /></p>
            <p className="mt-8 text-lg max-w-2xl fade d3">
               For a local food business, showing the menu is only part of the job. Captain’s Galley connects discovering the food with ordering ahead for pickup. The website introduces the food; the web app gives customers a way to order it.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="02" className="col-span-4 md:col-span-3">The workflow</Label>
          <ol className="col-span-4 md:col-span-8 md:col-start-5">
            {steps.map((s, i) => (
              <li key={s.title} className={`grid grid-cols-8 gap-4 py-7 border-t border-[var(--rule)] fade d${i + 1}`} data-testid={`step-workflow-${i}`}>
                <span className="col-span-1 label !text-[var(--fg)]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="col-span-7 md:col-span-3 serif text-2xl">{s.title}</h3>
                <p className="col-span-7 col-start-2 md:col-span-4 muted leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-blue wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-10 gap-y-8 items-end">
          <p className="col-span-4 md:col-span-7 title">
            <Lines lines={[<>Need customers to act, not just <em>browse?</em></>]} />
          </p>
          <div className="col-span-4 md:col-span-4 md:col-start-9 flex flex-col gap-5 fade d3">
            <Link href="/contact?need=Business%20App" className="btn btn-solid justify-between" data-testid="link-case-contact">
              Let’s talk <span className="arrow">→</span>
            </Link>
             <p className="label">Design + build — D.C.</p>
            <Link href="/#work" className="ulink self-start label !text-[var(--fg)]" data-testid="link-back-work">Back to work</Link>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
