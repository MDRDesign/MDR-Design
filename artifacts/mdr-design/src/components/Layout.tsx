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
    if (href !== '/#work') { after?.(); return; }
    e.preventDefault();
    after?.();
    if (loc === '/') {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname + '#work');
    } else {
      navigate('/');
      setTimeout(() => document.getElementById('work')?.scrollIntoView(), 60);
    }
  };
}

export function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-baseline gap-3" data-testid="link-home" aria-label="MDR Design, home">
      <span className="serif text-[1.65rem] leading-none">MDR</span>
      <span className="label hidden sm:inline">Design</span>
    </Link>
  );
}

export function Header() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const go = useWorkLink();

  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = panelRef.current?.querySelector<HTMLElement>('a,button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
      if (e.key === 'Tab' && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a,button'));
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 bg-[var(--bg)] px-3 py-2">Skip to content</a>
      <div className="wrap flex items-center justify-between py-6 md:py-8">
        <Wordmark />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-10 text-[0.8125rem] tracking-[0.14em] uppercase">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={(e: MouseEvent) => go(e, n.href)} className="ulink" aria-current={loc === n.href ? 'page' : undefined} data-testid={`link-nav-${n.label.toLowerCase()}`}>
                  {n.label}
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
        <div className="wrap flex items-center justify-between py-6">
          <span className="serif text-[1.65rem]">MDR</span>
          <button className="label !text-[var(--fg)] py-2" onClick={() => { setOpen(false); btnRef.current?.focus(); }} data-testid="button-menu-close">Close</button>
        </div>
        <div className="hr" />
        <nav aria-label="Mobile" className="wrap flex-1 flex flex-col justify-center">
          {NAV.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={(e: MouseEvent) => go(e, n.href, () => setOpen(false))} className="display text-[3.6rem] py-3 border-b border-[var(--rule)] flex items-baseline justify-between" data-testid={`link-mobile-${n.label.toLowerCase()}`}>
              <span>{i === 3 ? <em>{n.label}</em> : n.label}</span>
              <span className="label">0{i + 1}</span>
            </Link>
          ))}
        </nav>
        <p className="wrap pb-10 label">MDR Design — Web Design & Brand Identity</p>
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

export function Footer() {
  const go = useWorkLink();
  return (
    <footer className="wrap pt-24 pb-10">
      <div className="hr hr-ink" />
      <div className="grid12 gap-y-10 pt-10">
        <div className="col-span-4 md:col-span-6">
          <p className="display text-[clamp(3rem,9vw,8rem)]">MDR <em className="stone">Design</em></p>
        </div>
        <nav aria-label="Footer" className="col-span-2 md:col-span-3 flex flex-col gap-3 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={(e: MouseEvent) => go(e, n.href)} className="ulink self-start" data-testid={`link-footer-${n.label.toLowerCase()}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="col-span-2 md:col-span-3 flex flex-col gap-3 text-sm muted">
          <p>Danielle Crowder</p>
          <p>Web Design & Brand Identity for local businesses.</p>
          <ThemeToggle />
        </div>
      </div>
      <div className="mt-16 flex justify-between label">
        <span>© {new Date().getFullYear()} MDR Design</span>
        <span>Catalogue No. 01</span>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
