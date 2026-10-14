import { Link } from 'wouter';
import { Reveal, Lines, Label } from '@/components/Reveal';
import { SmartVideo } from '@/components/Media';
import { ProcessTexture } from '@/components/Art';
import { routeMeta } from '@/data/routeMeta';
import { useSeo } from '@/lib/seo';

const steps = [
  { n: '01', phase: 'Listen', t: 'Discovery conversation', w: 'Week 1', b: 'An unhurried call or visit. Your story, your customers, your competitors, what you’d fix if you could. I take notes; you talk.', out: 'Written summary of what I heard' },
  { n: '02', phase: 'Listen', t: 'Audit & landscape', w: 'Week 1–2', b: 'A look at your current presence, your search footprint and the shops your customers compare you to.', out: 'Short audit with priorities' },
  { n: '03', phase: 'Shape', t: 'Direction', w: 'Week 2–3', b: 'Two focused visual directions — type, color, voice, structure — each tied back to something you said.', out: 'Direction boards, one chosen' },
  { n: '04', phase: 'Shape', t: 'Design & words', w: 'Week 3–5', b: 'Brand marks and page designs refined together, with copy written to sound like you on a good day.', out: 'Full designs, two revision rounds' },
  { n: '05', phase: 'Launch', t: 'Build', w: 'Week 5–7', b: 'A fast, accessible site built properly, with local search foundations and the details most templates skip.', out: 'Staging site to review' },
  { n: '06', phase: 'Launch', t: 'Launch & handover', w: 'Week 7–8', b: 'Go-live, a walkthrough, and brand files organized so you can actually use them.', out: 'Live site, brand kit, guide' },
];

export default function Process() {
  useSeo(routeMeta['/process'], '/process');
  return (
    <>
      <Reveal as="header" immediate className="band band-crimson wrap pt-36 md:pt-44 pb-20">
        <p className="label fade d1"><span className="n">Process</span>Discovery to launch</p>
        <h1 className="mega mt-8">
          <Lines lines={['Listen.', <em key="s">Shape.</em>, 'Launch.']} start={0.15} />
        </h1>
        <div className="grid12 mt-10">
          <p className="col-span-4 md:col-span-5 md:col-start-8 text-lg leading-relaxed fade d4">
            Around eight weeks, one designer, no hand-offs. You’ll always know what’s happening and why.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="band band-ink wrap pad">
        <div className="frame wipe aspect-[16/10] md:aspect-[16/6] border border-[var(--rule)]">
          <SmartVideo src="media/process-texture.mp4" label="Process texture film" fallback={<ProcessTexture />} />
        </div>
      </Reveal>

      <section className="band band-ivory wrap pad" aria-label="Timeline">
        <ol>
          {steps.map((s) => (
            <Reveal as="li" key={s.n} className="grid12 gap-y-4 py-10 md:py-14 relative">
              <div className="hr draw absolute top-0 left-0" />
              <span className="col-span-1 md:col-span-2 numeral text-[clamp(2.8rem,4.5vw,4.5rem)]">{s.n}</span>
              <div className="col-span-3 md:col-span-2 fade d1">
                <p className="label">{s.phase}</p>
                <p className="mt-2 text-sm muted">{s.w}</p>
              </div>
              <h2 className="col-span-4 md:col-span-4 display text-3xl md:text-4xl fade d2">{s.t}</h2>
              <div className="col-span-4 md:col-span-4 fade d3">
                <p className="leading-relaxed muted">{s.b}</p>
                <p className="mt-4 text-sm"><span className="label mr-3">You get</span>{s.out}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal as="section" className="band band-ink wrap pad">
        <div className="grid12 gap-y-8 items-end">
          <Label n="—" className="col-span-4 md:col-span-3">Next</Label>
          <p className="col-span-4 md:col-span-6 serif text-3xl leading-tight"><Lines lines={[<>It starts with <em>one conversation.</em></>]} /></p>
          <Link href="/contact" className="col-span-4 md:col-span-3 btn btn-solid justify-between" data-testid="link-process-contact">Let’s talk <span className="arrow">→</span></Link>
        </div>
      </Reveal>
    </>
  );
}
