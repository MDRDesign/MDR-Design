import { useState } from 'react';
import { WizFixConcept } from './Art';

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  return (
    <figure>
      <div className="ba frame relative aspect-[4/3] md:aspect-[16/8] select-none" data-cursor="view">
        <div className="absolute inset-0"><WizFixConcept variant="before" /></div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <WizFixConcept />
        </div>
        <span className="absolute left-3 bottom-3 z-10 bg-[var(--bg)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] border border-[var(--rule)]">Before — concept placeholder</span>
        <span className="absolute right-3 bottom-3 z-10 bg-[var(--bg)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] border border-[var(--rule)]">After — concept placeholder</span>
        <div className="ba-divider pointer-events-none absolute inset-y-0 z-[4] -ml-px" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 bg-[#0e0e0e] text-[#f4f1ea] flex items-center justify-center label !text-[#f4f1ea] !tracking-[0.18em] border-2 border-[#f4f1ea]">
            Drag
          </div>
        </div>
        <input
          type="range" min={0} max={100} step={1} value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare before and after concept placeholders"
          aria-valuetext={`${pos}% before shown`}
          data-testid="input-before-after"
        />
      </div>
      <figcaption className="mt-4 px-[var(--gutter)] flex justify-between label">
        <span>Fig. 02 — Before / after (illustrative)</span>
        <span>Use arrow keys or drag</span>
      </figcaption>
    </figure>
  );
}
