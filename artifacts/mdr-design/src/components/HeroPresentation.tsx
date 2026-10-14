import { HeroPackageReveal } from './HeroPackageReveal';

/**
 * Opening plate: studio artwork on a coral offset plate, with quiet drafting
 * linework (rulers, construction arc, scan line). All linework is decorative.
 * Motion is CSS-only and paused by `.hero-paused` on an ancestor or reduced motion.
 */
export function HeroPlate() {
  const ticks = Array.from({ length: 21 }, (_, i) => i);
  return (
    <figure className="col-span-4 md:col-span-5 px-4 md:px-0" data-testid="figure-hero-art">
      <div className="hero-plate relative aspect-[4/5]">
        <span className="hero-coral" aria-hidden="true" />
        <div className="frame frame-fill wipe d3">
          <HeroPackageReveal />
        </div>
        <div className="hero-drafting" aria-hidden="true">
        <svg className="hero-lines" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {/* rulers */}
          <g className="hl-ruler">
            {ticks.map((i) => (
              <line key={`t${i}`} x1={i * 20} y1={0} x2={i * 20} y2={i % 5 === 0 ? 12 : 6} />
            ))}
            {ticks.map((i) => (
              <line key={`l${i}`} x1={0} y1={i * 25} x2={i % 5 === 0 ? 12 : 6} y2={i * 25} />
            ))}
          </g>
          {/* construction geometry */}
          <g className="hl-guide">
            <line x1="0" y1="310" x2="400" y2="310" />
            <line x1="248" y1="0" x2="248" y2="500" />
            <circle cx="248" cy="310" r="132" />
          </g>
          <path className="hl-arc" d="M 116 310 A 132 132 0 0 1 380 310" pathLength={1} />
          <g className="hl-mark">
            <circle cx="248" cy="310" r="4" />
            <line x1="236" y1="310" x2="260" y2="310" />
            <line x1="248" y1="298" x2="248" y2="322" />
          </g>
        </svg>
        <span className="hero-scan" aria-hidden="true" />
        </div>
        <span className="crop tl" aria-hidden="true" /><span className="crop tr" aria-hidden="true" /><span className="crop bl" aria-hidden="true" /><span className="crop br" aria-hidden="true" />
      </div>
      <figcaption className="mt-5 flex justify-between label"><span><span className="hero-dot" aria-hidden="true" />Pl. 01</span><span>Local brands, seen properly</span></figcaption>
    </figure>
  );
}
