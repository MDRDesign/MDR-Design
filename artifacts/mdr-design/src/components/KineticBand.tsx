import { Fragment } from 'react';

const WORDS = ['Brand Identity', 'Web Design', 'Local Presence', 'Art Direction'];

function Group({ hidden }: { hidden?: boolean }) {
  return (
    <span className="kinetic-group" aria-hidden={hidden || undefined}>
      {WORDS.map((w, i) => (
        <Fragment key={w}>
          <span className={`kin-word ${i % 2 ? 'kin-serif' : 'kin-outline'}`}>{w}</span>
          <span className="kin-dia" aria-hidden="true" />
        </Fragment>
      ))}
    </span>
  );
}

export function KineticBand() {
  return (
    <section className="band band-ink kinetic py-10 md:py-14 border-y border-[var(--rule)]" aria-label="Disciplines: Brand Identity, Web Design, Local Presence, Art Direction" tabIndex={0} data-testid="band-kinetic">
      <div className="kinetic-track">
        <Group hidden />
        <Group hidden />
      </div>
    </section>
  );
}
