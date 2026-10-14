import { Link, useParams } from 'wouter';
import { Reveal, Lines } from '@/components/Reveal';
import { SmartImage } from '@/components/Media';
import { ConceptTag, DeviceMockup, WizFixConcept } from '@/components/Art';
import { WizFixDevices, WizFixScreenshot } from '@/components/WizFixMedia';
import { getPreview } from '@/data/previews';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';
import NotFound from './not-found';

export default function Preview() {
  const { slug = '' } = useParams<{ slug: string }>();
  const p = getPreview(slug);
  useSeo(
    p ? { ...routeMeta['/preview/:slug'], title: `Prepared for ${p.clientName} — ${p.businessName} · MDR Design` } : routeMeta['/preview/:slug'],
    `/preview/${slug}`,
  );
  if (!p) return <NotFound />;
  const isWizFix = p.slug === 'wizfix';
  const contactHref = `/contact?source=${encodeURIComponent(`preview-${p.slug}`)}&client=${encodeURIComponent(p.clientName)}&business=${encodeURIComponent(p.businessName)}`;

  return (
    <main id="main" className="min-h-[100dvh]">
      <div className="band band-blue wrap pb-20">
      <Reveal as="header" immediate className="pt-8 flex justify-between items-baseline fade">
        <span className="serif italic text-[1.6rem]">MDR</span>
        <span className="label">{isWizFix ? 'Unlisted project preview' : 'Unlisted concept preview'}</span>
      </Reveal>
      <Reveal as="section" immediate className="pt-20 md:pt-32">
        <p className="label fade d1"><span className="n">Prepared for {p.clientName}</span>{p.businessName}</p>
        <h1 className="mega mt-8" data-testid="text-preview-title">
          <Lines lines={[`Prepared for ${p.clientName} —`, <em key="b">{p.businessName}</em>]} start={0.15} />
        </h1>
        <div className="hr hr-ink draw d3 mt-12" />
      </Reveal>
      </div>

      <section className="band band-ink wrap pad space-y-16">
        {p.images.map((img, i) => (
          <Reveal key={img.src} as="figure">
            <div className="frame wipe aspect-[4/3] md:aspect-[16/9] border border-[var(--rule)]" data-cursor="view">
              {isWizFix ? <WizFixScreenshot /> : (
                <>
                  <SmartImage src={img.src} alt={img.caption} fallback={i % 2 ? <DeviceMockup /> : <WizFixConcept />} />
                  <ConceptTag text="Concept" />
                </>
              )}
            </div>
            <figcaption className="label mt-3">Fig. {String(i + 1).padStart(2, '0')} — {img.caption}</figcaption>
          </Reveal>
        ))}
        <Reveal as="figure">
          <div className="frame wipe aspect-[16/10] border border-[var(--rule)]">
            {isWizFix ? <WizFixDevices /> : <><DeviceMockup /><ConceptTag text="Concept" /></>}
          </div>
          <figcaption className="label mt-3">Across devices — {isWizFix ? 'published site' : 'concept'}</figcaption>
        </Reveal>
      </section>

      <Reveal as="section" className="band band-ivory wrap pad">
        <div className="grid12 gap-y-6">
          <p className="label col-span-4 md:col-span-3"><span className="n">A note</span>from Danielle</p>
          <p className="col-span-4 md:col-span-7 md:col-start-5 serif text-[clamp(1.35rem,2vw,1.85rem)] leading-snug fade d2" data-testid="text-preview-note">{p.note}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-blue wrap pad">
        <div className="hr hr-ink draw" />
        <div className="grid12 pt-12 gap-y-6 items-end">
          <div className="col-span-4 md:col-span-6 md:col-start-5 fade d2">
            <Link href={contactHref} className="btn btn-solid w-full justify-between text-base" data-testid="link-preview-cta">
              I’m interested — let’s talk. <span className="arrow">→</span>
            </Link>
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="ulink mt-6 inline-block text-base muted" data-testid="link-preview-live">See the current build ↗</a>
            )}
          </div>
        </div>
      </Reveal>
    </main>
  );
}
