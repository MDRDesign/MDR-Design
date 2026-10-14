import { Link } from 'wouter';
import { Reveal, Lines } from '@/components/Reveal';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const services = [
  { n: 'A', name: 'Brand Starter', need: 'Brand Starter', lede: 'For the business that’s outgrown its first logo.', items: ['Discovery conversation', 'Logo & wordmark system', 'Color and type palette', 'Voice notes & tagline', 'Signage, card and social basics'] },
  { n: 'B', name: 'Website', need: 'Website', lede: 'For the brand that’s solid — and a site that isn’t.', items: ['Discovery & audit', 'Site structure and copy', 'Custom design, mobile first', 'Local search foundations', 'Build, launch & handover'] },
  { n: 'C', name: 'Business Apps', need: 'Business App', lede: 'Tools for customers and teams, built around the way you work.', items: ['Discovery & workflow planning', 'Custom web app design & development', 'Ordering, scheduling or tracking', 'Data, accounts & permissions', 'Build, launch & handover'] },
];

export default function Services() {
  useSeo(routeMeta['/services'], '/services');
  return (
    <>
      <Reveal as="header" immediate className="band band-ink wrap pt-28 md:pt-32 pb-14 md:pb-16">
        <p className="label fade d1"><span className="n">Services</span>Three ways in</p>
        <h1 className="mega mt-8">
          <Lines lines={['Choose a door.', <>I’ll <em>listen</em> either way.</>]} start={0.15} />
        </h1>
        <p className="mt-8 max-w-xl text-lg muted fade d4">Branding, websites and business apps. Each is scoped after we talk — on its own, or as one connected launch.</p>
      </Reveal>
      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid grid-cols-1 md:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.n} className={`py-10 md:px-8 flex flex-col border-b md:border-b-0 border-[var(--rule)] ${i > 0 ? 'md:border-l' : 'md:pl-0'} fade d${i + 2}`} data-testid={`card-service-${i}`}>
              <span className="label !text-[var(--fg)]">{s.n}</span>
              <h2 className="display text-3xl md:text-4xl mt-6">{s.name}</h2>
              <p className="serif text-xl italic mt-4 muted">{s.lede}</p>
              <ul className="mt-8 flex-1">
                {s.items.map((it) => <li key={it} className="py-3 border-t border-[var(--rule)] text-sm">{it}</li>)}
              </ul>
              <Link href={`/contact?need=${encodeURIComponent(s.need)}`} className="btn mt-10 justify-between" data-testid={`link-inquire-${i}`}>
                Inquire <span className="arrow">→</span>
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-10 pt-6 border-t border-[var(--rule)] text-sm muted max-w-3xl">
          Need the full presence? <Link href="/contact?need=Brand%20%2B%20Website" className="ulink text-[var(--fg)]" data-testid="link-inquire-bundle">Brand + Website</Link> combines both services in one direction, with launch assets and thirty days of post-launch care.
        </p>
      </Reveal>
    </>
  );
}
