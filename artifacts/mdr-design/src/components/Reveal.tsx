import { type ElementType, type ReactNode } from 'react';
import { useInView } from '@/lib/motion';

type Props = { as?: ElementType; className?: string; children: ReactNode; id?: string; immediate?: boolean };

/** Section wrapper: children using .line/.fade/.draw/.wipe animate when it enters view. */
export function Reveal({ as: Tag = 'div', className = '', children, id, immediate }: Props) {
  const { ref, inView } = useInView<HTMLElement>({ margin: immediate ? '0px' : undefined });
  return (
    <Tag ref={ref} id={id} className={`${className} ${immediate || inView ? 'is-in' : ''}`}>
      {children}
    </Tag>
  );
}

/** Line-by-line text reveal. Pass each visual line as an item. */
export function Lines({ lines, className = '', delayStep = 0.11, start = 0 }: { lines: ReactNode[]; className?: string; delayStep?: number; start?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className={`line ${className}`}>
          <span style={{ transitionDelay: `${start + i * delayStep}s` }}>{l}</span>
        </span>
      ))}
    </>
  );
}

export function Label({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`label ${className}`}>
      {n && <span className="n">{n}</span>}
      {children}
    </p>
  );
}
