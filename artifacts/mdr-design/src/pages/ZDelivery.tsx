import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { mediaUrl } from '@/components/Media';
import { projectReferences } from '@/data/projectReferences';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';
import NotFound from './not-found';

const screens: { file: string; height: number; title: string; body: string; alt: string }[] = [
  {
    file: 'media/z-delivery-mobile-dashboard.webp',
    height: 1025,
    title: 'Quote dashboard',
    body: 'An overview groups quote totals, scheduled and pending jobs, and vehicle-fit warnings before staff open an individual quote.',
    alt: 'Z-Delivery dashboard on a phone, showing quote totals, scheduled and pending jobs, and vehicle-fit warnings',
  },
  {
    file: 'media/z-delivery-mobile-quote.webp',
    height: 1029,
    title: 'Quoted price range',
    body: 'Each quote shows a price range alongside vehicle-fit and risk checks, putting the reasoning behind a number on the same screen.',
    alt: 'Z-Delivery quote screen on a phone, showing a quoted price range with vehicle-fit and risk checks',
  },
  {
    file: 'media/z-delivery-mobile-details.webp',
    height: 1030,
    title: 'Access and items',
    body: 'Access and parking fields share a screen with item photos, so staff can record delivery conditions alongside the items.',
    alt: 'Z-Delivery job details on a phone, with access and parking notes and item photos',
  },
  {
    file: 'media/z-delivery-mobile-route.webp',
    height: 1032,
    title: 'Live route',
    body: 'Route tools show ETA, distance and traffic for the job in progress.',
    alt: 'Z-Delivery live route screen on a phone, showing ETA, distance and traffic',
  },
];

export default function ZDelivery() {
  useSeo(routeMeta['/work/z-delivery'], '/work/z-delivery');
  const p = projectReferences.find((r) => r.slug === 'z-delivery');
  if (!p) return <NotFound />;
  const host = new URL(p.liveUrl).hostname;
  const facts: [string, string][] = [
    ['Client', p.client],
    ['Format', 'Mobile-friendly web app'],
    ['Discipline', p.disciplines.join(' + ')],
    ['Year', p.year ?? ''],
  ];

  return (
    <article>
      <Reveal as="header" immediate className="band band-blue wrap pt-28 md:pt-32 pb-14 md:pb-16">
        <p className="label fade d1"><span className="n">Project {p.number}</span>Web App</p>
        <h1 className="mega mt-8 max-w-[16ch]" data-testid="text-case-title">
          <Lines lines={['Z-Delivery', <em key="z">quote to route</em>]} start={0.15} delayStep={0.15} />
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
          <p className="col-span-4 md:col-span-6 text-lg leading-relaxed fade d5" data-testid="text-case-summary">
            {p.description} One web app, used in the browser on a phone, carries a job from first quote to the drive itself.
          </p>
          <div className="col-span-4 md:col-span-3 md:col-start-10 fade d6">
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn w-full justify-between" data-testid="link-live-app">
              Visit live app <span className="arrow" aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="label mt-3">Opens to staff sign-in</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ink wrap pad">
        <Label n="01">The screens</Label>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mt-10">
          {screens.map((s, i) => (
            <li key={s.file} className={`fade d${i + 1}`} data-testid={`figure-zdelivery-${i}`}>
              <figure>
                <div className="border border-[var(--rule)] bg-[var(--surface)] max-w-[340px] mx-auto">
                  <img src={mediaUrl(s.file)} alt={s.alt} width={565} height={s.height} className="block w-full h-auto" loading="lazy" decoding="async" data-testid={`img-zdelivery-${i}`} />
                </div>
                <figcaption className="mt-5">
                  <span className="label">Fig. {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="serif text-2xl mt-2">{s.title}</h3>
                  <p className="muted text-sm leading-relaxed mt-2">{s.body}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
        <p className="label mt-12 flex flex-wrap justify-between gap-3" data-testid="text-zdelivery-disclosure">
          <span>Owner-provided screens with fictional customer data. Figures are screen content, not measured business results.</span>
          <span>{host}</span>
        </p>
      </Reveal>

      <Reveal as="section" className="band band-crimson wrap pad">
        <div className="grid12 gap-y-6">
          <Label n="02" className="col-span-4 md:col-span-3">The business need</Label>
          <p className="col-span-4 md:col-span-8 md:col-start-5 title">
            <Lines lines={[<>Quoting, checking and routing — <em>in one place</em> staff can carry.</>]} />
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-blue wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-10 gap-y-8 items-end">
          <p className="col-span-4 md:col-span-7 title">
            <Lines lines={[<>Running your operation on <em>spreadsheets?</em></>]} />
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
