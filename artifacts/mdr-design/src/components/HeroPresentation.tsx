import { HeroStreetFilm } from './HeroStreetFilm';

/**
 * Keep the established coral offset, rulers and crop marks around the film.
 * Construction guides are omitted so they do not cover the action or phone text.
 */
export function HeroPlate({ paused = false }: { paused?: boolean }) {
  const ticks = Array.from({ length: 21 }, (_, i) => i);
  return (
    <figure className="col-span-4 md:col-span-5 px-4 md:px-0" data-testid="figure-hero-art">
      <div className="hero-plate relative aspect-[9/16] max-w-[340px] mx-auto">
        <span className="hero-coral" aria-hidden="true" />
        <div className="frame frame-fill wipe d3">
          <HeroStreetFilm paused={paused} />
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
        </svg>
        </div>
        <span className="crop tl" aria-hidden="true" /><span className="crop tr" aria-hidden="true" /><span className="crop bl" aria-hidden="true" /><span className="crop br" aria-hidden="true" />
      </div>
      <figcaption className="mt-5 flex justify-between label"><span><span className="hero-dot" aria-hidden="true" />Pl. 01</span><span>Local brands, seen properly</span></figcaption>
    </figure>
  );
}
