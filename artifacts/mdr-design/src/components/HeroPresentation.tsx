import { HeroMonogram } from './HeroMonogram';

/** A compact studio identity replaces the former full-height film plate. */
export function HeroPlate({ paused = false }: { paused?: boolean }) {
  return (
    <figure className="col-span-4 md:col-span-5 self-center px-4 md:px-0" data-testid="figure-hero-art">
      <HeroMonogram paused={paused} />
      <figcaption className="mt-8 flex justify-between label gap-4">
        <span className="shrink-0"><span className="hero-dot" aria-hidden="true" />Pl. 01</span>
        <span className="text-right">Local brands, seen properly</span>
      </figcaption>
    </figure>
  );
}
