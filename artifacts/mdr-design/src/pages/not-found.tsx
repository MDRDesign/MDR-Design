import { Link } from 'wouter';
import { Reveal, Lines } from '@/components/Reveal';

export default function NotFound() {
  return (
    <Reveal as="section" immediate className="band band-ink wrap min-h-[70dvh] pt-32 pb-16 grid12 items-end">
      <span className="col-span-4 md:col-span-5 numeral text-[clamp(6rem,14vw,12rem)]">404</span>
      <div className="col-span-4 md:col-span-6 md:col-start-7">
        <h1 className="title"><Lines lines={[<>This page is <em>not in the catalogue.</em></>]} /></h1>
        <Link href="/" className="btn mt-10" data-testid="link-404-home">Return home <span className="arrow">→</span></Link>
      </div>
    </Reveal>
  );
}
