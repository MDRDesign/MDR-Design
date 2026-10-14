/* Illustrative SVG artwork. Published WizFix captures live in WizFixMedia.
 * Keep any remaining concept artwork explicitly labelled; the BeforeAfter
 * comparison uses the owner-supplied former-site capture instead.
 */

const ink = 'var(--fg)';
const rule = 'var(--rule)';
const ox = 'var(--accent-c)';
const stone = 'var(--stone)';

export function ConceptTag({ text = 'Concept placeholder' }: { text?: string }) {
  return (
    <span className="absolute left-3 top-3 z-10 bg-[var(--bg)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--fg)] border border-[var(--rule)]">
      {text}
    </span>
  );
}

/** Hero: Runway-generated ivory and coral paper study (studio artwork, not a client project). */
export function HeroArt() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}media/mdr-structure.webp`}
      alt="Layered ivory and coral paper folio with a gently curved page on a dark teal surface"
      className="frame-media"
      loading="eager"
      decoding="async"
    />
  );
}

/** WizFix concept homepage in a browser frame (synthetic, labeled concept). */
export function WizFixConcept({ variant = 'after' }: { variant?: 'after' | 'before' }) {
  if (variant === 'before') return <BeforeConcept />;
  return (
    <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Concept placeholder: refined WizFix Computers homepage direction">
      <rect width="1200" height="760" fill="#1d2630" />
      <rect x="0" y="0" width="1200" height="44" fill="#151c24" />
      {[24, 46, 68].map((x) => <circle key={x} cx={x} cy="22" r="5" fill="#3a4654" />)}
      <rect x="380" y="12" width="440" height="20" fill="#232d39" />
      <text x="600" y="26" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontSize="11" fill="#8a96a3">wizfix — concept</text>
      <text x="80" y="104" fontFamily="Instrument Serif, serif" fontSize="30" fill="#efe9dc">WizFix</text>
      {['Repair', 'IT Support', 'Printing', 'Visit'].map((t, i) => (
        <text key={t} x={760 + i * 100} y="100" fontFamily="Instrument Sans, sans-serif" fontSize="14" fill="#c9c1b2">{t}</text>
      ))}
      <line x1="80" y1="130" x2="1120" y2="130" stroke="#33404e" />
      <text x="80" y="250" fontFamily="Instrument Serif, serif" fontSize="76" fill="#efe9dc">Fixed right.</text>
      <text x="80" y="335" fontFamily="Instrument Serif, serif" fontSize="76" fontStyle="italic" fill="#e3a65a">Explained clearly.</text>
      <text x="80" y="395" fontFamily="Instrument Sans, sans-serif" fontSize="18" fill="#a9b2bc">Computer repair, IT and printing in Diamond Bar.</text>
      <rect x="80" y="430" width="190" height="52" fill="#e3a65a" />
      <text x="175" y="462" textAnchor="middle" fontFamily="Instrument Sans, sans-serif" fontSize="14" letterSpacing="2" fill="#1d2630">BOOK A REPAIR</text>
      {['01 Repair', '02 IT Support', '03 Printing'].map((t, i) => (
        <g key={t}>
          <line x1={80 + i * 350} y1="560" x2={400 + i * 350} y2="560" stroke="#4a5868" />
          <text x={80 + i * 350} y="600" fontFamily="Instrument Serif, serif" fontSize="30" fill="#efe9dc">{t}</text>
          <rect x={80 + i * 350} y="625" width="240" height="8" fill="#2c3744" />
          <rect x={80 + i * 350} y="645" width="180" height="8" fill="#2c3744" />
        </g>
      ))}
      <g transform="translate(860 190)" fill="none" stroke="#4a5868">
        <rect width="260" height="300" />
        <rect x="40" y="60" width="180" height="120" stroke="#e3a65a" />
        <line x1="20" y1="210" x2="240" y2="210" />
        <line x1="90" y1="180" x2="170" y2="180" />
        <circle cx="130" cy="250" r="18" />
      </g>
    </svg>
  );
}

function BeforeConcept() {
  return (
    <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Concept placeholder: generic cluttered starting point, not a real screenshot">
      <rect width="1200" height="760" fill="#e9e6e1" />
      <rect width="1200" height="44" fill="#d0ccc5" />
      <rect x="0" y="44" width="1200" height="90" fill="#4466aa" />
      <text x="40" y="104" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="bold" fill="#ffee55">COMPUTER REPAIR!!</text>
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={40 + i * 160} y="160" width="140" height="28" fill="#c8c3bb" />
      ))}
      <rect x="40" y="220" width="700" height="300" fill="#cfcac2" />
      <text x="390" y="380" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fill="#8b857c">[ stock photo ]</text>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x="780" y={220 + i * 34} width={380 - (i % 3) * 60} height="14" fill="#bdb8af" />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x={40 + i * 290} y="560" width="260" height="150" fill="#d6d1c9" stroke="#b5afa5" />
      ))}
      <rect x="980" y="60" width="180" height="58" fill="#dd4433" />
      <text x="1070" y="96" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#fff">CALL NOW</text>
    </svg>
  );
}

/** Process texture: drafting paper with measured contour lines. */
export function ProcessTexture() {
  return (
    <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Drafting texture of contour lines and measurement marks">
      <rect width="1200" height="600" fill="var(--surface)" />
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d={`M-20 ${120 + i * 18} C 300 ${40 + i * 20}, 600 ${260 + i * 12}, 1220 ${100 + i * 19}`} fill="none" stroke={i === 11 ? ox : rule} strokeWidth={i === 11 ? 1.4 : 1} />
      ))}
      {Array.from({ length: 49 }).map((_, i) => (
        <line key={i} x1={i * 25} y1="0" x2={i * 25} y2={i % 4 === 0 ? 18 : 8} stroke={stone} />
      ))}
      <text x="1170" y="580" textAnchor="end" fontFamily="Instrument Sans, sans-serif" fontSize="11" letterSpacing="3" fill={stone}>STUDY — DISCOVERY TO LAUNCH</text>
    </svg>
  );
}

/** Device mockup: laptop + phone, both showing the concept. */
export function DeviceMockup() {
  return (
    <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Concept placeholder: WizFix design shown on a laptop and a phone">
      <rect width="1200" height="760" fill="var(--surface)" />
      <line x1="0" y1="640" x2="1200" y2="640" stroke={rule} />
      <g transform="translate(170 140)">
        <rect width="760" height="470" fill="#151c24" />
        <rect x="14" y="14" width="732" height="442" fill="#1d2630" />
        <text x="50" y="80" fontFamily="Instrument Serif, serif" fontSize="22" fill="#efe9dc">WizFix</text>
        <text x="50" y="200" fontFamily="Instrument Serif, serif" fontSize="56" fill="#efe9dc">Fixed right.</text>
        <text x="50" y="262" fontFamily="Instrument Serif, serif" fontSize="56" fontStyle="italic" fill="#e3a65a">Explained clearly.</text>
        <rect x="50" y="300" width="150" height="40" fill="#e3a65a" />
        {[0, 1, 2].map((i) => <line key={i} x1={50 + i * 230} y1="390" x2={250 + i * 230} y2="390" stroke="#4a5868" />)}
        <path d="M-60 470 H820 L790 500 H-30 Z" fill={ink} />
      </g>
      <g transform="translate(860 300)">
        <rect width="190" height="380" rx="0" fill="#151c24" />
        <rect x="10" y="12" width="170" height="356" fill="#1d2630" />
        <text x="26" y="50" fontFamily="Instrument Serif, serif" fontSize="16" fill="#efe9dc">WizFix</text>
        <text x="26" y="140" fontFamily="Instrument Serif, serif" fontSize="28" fill="#efe9dc">Fixed</text>
        <text x="26" y="172" fontFamily="Instrument Serif, serif" fontSize="28" fill="#efe9dc">right.</text>
        <text x="26" y="204" fontFamily="Instrument Serif, serif" fontSize="22" fontStyle="italic" fill="#e3a65a">Explained.</text>
        <rect x="26" y="230" width="110" height="30" fill="#e3a65a" />
        {[0, 1, 2].map((i) => <line key={i} x1="26" y1={290 + i * 22} x2="164" y2={290 + i * 22} stroke="#4a5868" />)}
      </g>
    </svg>
  );
}

/** Film placeholder: a storyboard strip. */
export function FilmPlaceholder() {
  return (
    <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Storyboard placeholder for the WizFix walkthrough film">
      <rect width="1600" height="700" fill="#141414" />
      {Array.from({ length: 40 }).map((_, i) => (
        <g key={i}>
          <rect x={i * 40 + 10} y="30" width="20" height="14" fill="#2a2926" />
          <rect x={i * 40 + 10} y="656" width="20" height="14" fill="#2a2926" />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${80 + i * 500} 110)`}>
          <rect width="440" height="480" fill="none" stroke="#3a3833" />
          <text x="20" y="40" fontFamily="Instrument Sans, sans-serif" fontSize="12" letterSpacing="3" fill="#8f897f">{`SCENE 0${i + 1}`}</text>
          <text x="220" y="270" textAnchor="middle" fontFamily="Instrument Serif, serif" fontSize="44" fontStyle={i === 1 ? 'italic' : 'normal'} fill="#f4f1ea">{['The counter', 'The fix', 'The screen'][i]}</text>
        </g>
      ))}
      <circle cx="800" cy="350" r="46" fill="none" stroke="#f4f1ea" />
      <path d="M788 330 L818 350 L788 370 Z" fill="#f4f1ea" />
    </svg>
  );
}
