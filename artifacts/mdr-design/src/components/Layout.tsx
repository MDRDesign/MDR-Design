import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/process', label: 'Process' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

function useWorkLink() {
  const [loc, navigate] = useLocation();
  return (e: MouseEvent, href: string, after?: () => void) => {
    if (href !== '/#work' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { after?.(); return; }
    e.preventDefault();
    after?.();
    if (loc === '/') {
      document.getElementById('work')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      if (!window.location.hash) history.pushState(null, '', window.location.pathname + '#work');
    } else {
      navigate('/#work');
    }
  };
}

export function Wordmark({ testId = 'link-home', onClick }: { testId?: string; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group inline-flex items-baseline gap-1.5" data-testid={testId} aria-label="MDR Design, home">
      <span className="serif italic text-[1.6rem] leading-none">MDR</span>
      <span className="label">Design</span>
    </Link>
  );
}

export function Header() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const go = useWorkLink();
  const closeForNavigation = () => {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }));
  };

  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = panelRef.current?.querySelector<HTMLElement>('a,button');
    // Wait for the closed panel's visibility style to be removed before focus.
    let frame: number;
    const focusFirst = () => {
      if (!first) return;
      if (getComputedStyle(first).visibility === 'visible') first.focus();
      else frame = requestAnimationFrame(focusFirst);
    };
    frame = requestAnimationFrame(focusFirst);
    const desktop = window.matchMedia('(min-width: 768px)');
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', onResize);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
      if (e.key === 'Tab' && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a,button'));
        const a = f[0], z = f[f.length - 1];
        if (!panelRef.current.contains(document.activeElement)) { e.preventDefault(); a.focus(); }
        else if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      desktop.removeEventListener('change', onResize);
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="chrome-ink absolute inset-x-0 top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 bg-[var(--bg)] px-3 py-2">Skip to content</a>
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 md:py-6">
        <Wordmark />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="label !text-[var(--fg)] flex items-center gap-9 !text-[0.75rem]">
            {NAV.map((n) => (
              <li key={n.href} className="flex items-center">
                <Link href={n.href} onClick={(e: MouseEvent) => go(e, n.href)} className={n.href === '/contact' ? 'btn nav-cta' : 'ulink'} aria-current={loc === n.href ? 'page' : undefined} data-testid={`link-nav-${n.label.toLowerCase()}`}>
                  {n.href === '/contact' ? <><span className="hb hb-word">Contact</span> <span className="arrow">→</span></> : n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button ref={btnRef} className="md:hidden label !text-[var(--fg)] py-2" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)} data-testid="button-menu-open">
          Menu
        </button>
      </div>
      <div id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu" data-open={open} className="menu-panel fixed inset-0 z-50 bg-[var(--bg)] md:hidden flex flex-col">
        <div className="wrap w-full shrink-0 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
          <Wordmark testId="link-mobile-home" onClick={closeForNavigation} />
          <button className="label !text-[var(--fg)] py-2" onClick={() => { setOpen(false); btnRef.current?.focus(); }} data-testid="button-menu-close">Close</button>
        </div>
        <div className="hr" />
        <nav aria-label="Mobile" className="wrap flex-1 flex flex-col justify-center">
          {NAV.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={(e: MouseEvent) => go(e, n.href, closeForNavigation)} className="display text-[2rem] py-4 border-b border-[var(--rule)] flex items-baseline justify-between" data-testid={`link-mobile-${n.label.toLowerCase()}`}>
              <span>{i === 3 ? <em className="hb hb-word">{n.label}</em> : n.label}</span>
              <span className="label">0{i + 1}</span>
            </Link>
          ))}
        </nav>
        <p className="wrap w-full shrink-0 pb-10 label">MDR Design — Websites · Apps · Branding</p>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('mdr-theme', next ? 'dark' : 'light');
  };
  return (
    <button onClick={toggle} className="ulink label !text-[var(--fg)]" aria-pressed={dark} data-testid="button-theme">
      {dark ? 'Ivory edition' : 'Ink edition'}
    </button>
  );
}

function LaTime() {
  const fmt = () => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => { const i = window.setInterval(() => setT(fmt()), 1000); return () => window.clearInterval(i); }, []);
  return <time className="tabular-nums" data-testid="text-la-time">{t}</time>;
}

export function Footer() {
  const go = useWorkLink();
  return (
    <footer className="site-footer band band-ink pt-16 md:pt-20 pb-8">
      <div className="wrap">
        <div className="grid12 gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <p className="label">Studio time — Los Angeles</p>
            <p className="display text-[clamp(2.2rem,4vw,3.5rem)] mt-3"><LaTime /></p>
          </div>
          <nav aria-label="Footer" className="col-span-2 md:col-span-3 md:col-start-7 flex flex-col gap-3 label !text-[var(--fg)] !text-[0.75rem]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={(e: MouseEvent) => go(e, n.href)} className="ulink self-start" data-testid={`link-footer-${n.label.toLowerCase()}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="col-span-2 md:col-span-3 md:col-start-10 flex flex-col gap-3 text-base muted">
            <p className="text-[var(--fg)]">D.C.</p>
            <p>Web design, business app development & branding for local businesses.</p>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="wrap mt-12 md:mt-16"><p className="foot-mark hb" aria-hidden="true" style={{ ['--hb-w' as string]: '54vw' }}>MDR <em>Design</em></p></div>
      <div className="wrap mt-8 flex justify-between label">
        <span>© {new Date().getFullYear()} MDR Design</span>
        <span>Catalogue No. 01</span>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className={loc === '/work/wizfix' ? undefined : 'public-reflow'}>{children}</main>
      <Footer />
    </>
  );
}
