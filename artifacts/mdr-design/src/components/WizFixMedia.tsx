import { mediaUrl } from './Media';

/** Captured from the published WizFix site, not a design concept. */
export function WizFixScreenshot({ detail = false }: { detail?: boolean }) {
  return (
    <img
      src={mediaUrl(`media/wizfix-${detail ? 'detail' : 'desktop'}.webp`)}
      srcSet={detail ? undefined : `${mediaUrl('media/wizfix-desktop-960.webp')} 960w, ${mediaUrl('media/wizfix-desktop.webp')} 1440w`}
      sizes={detail ? undefined : '(max-width: 767px) 100vw, 85vw'}
      width={1440}
      height={detail ? 726 : 900}
      className="frame-media"
      style={{ objectFit: 'contain' }}
      alt={detail ? 'Homepage detail from the published WizFix Computers website: repair services and a service ticket' : 'Published WizFix Computers homepage with computer repair services and the Request service button'}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Real desktop and mobile captures in the existing editorial device frame. */
export function WizFixDevices() {
  return (
    <svg viewBox="0 0 1200 760" className="h-full w-full" role="img" aria-label="Published WizFix Computers website at desktop and phone screen sizes">
      <rect width="1200" height="760" fill="var(--surface)" />
      <line x1="0" y1="640" x2="1200" y2="640" stroke="var(--rule)" />
      <rect x="90" y="110" width="900" height="582" fill="#151c24" />
      <image href={mediaUrl('media/wizfix-desktop.webp')} x="104" y="124" width="872" height="545" />
      <path d="M30 692 H1050 L1020 720 H60 Z" fill="#151c24" />
      <rect x="916" y="240" width="224" height="478" fill="#151c24" />
      <image href={mediaUrl('media/wizfix-mobile.webp')} x="926" y="250" width="204" height="442" />
    </svg>
  );
}
