import type { ReactNode } from 'react';

export type IconName = 'arrow' | 'chevron' | 'copy' | 'heart' | 'check' | 'settings' | 'close' | 'spark' | 'smile' | 'flame' | 'hand' | 'sound' | 'pause' | 'trash';
const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="m10 5-7 7 7 7M3 12h18" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  heart: <path d="M20.4 4.8a5.3 5.3 0 0 0-7.5 0l-.9.9-.9-.9a5.3 5.3 0 0 0-7.5 7.5L12 21l8.4-8.7a5.3 5.3 0 0 0 0-7.5Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /><path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z" /></>,
  smile: <><path d="M4 10a8 8 0 1 0 16 0M8 14c2 3 6 3 8 0" /><path d="M8 7v1m8-1v1" /></>,
  flame: <path d="M13 2c1 6-5 7-3 12 2-1 3-3 3-5 5 3 7 7 4 11-3 4-10 2-11-3C4 11 9 8 13 2Z" />,
  hand: <><path d="M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 4-3 7-7 7h-1c-2 0-4-1-5-3l-4-6a2 2 0 0 1 3-2l2 2" /></>,
  sound: <><path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
  pause: <><path d="M8 4v16M16 4v16" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" /></>,
};
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function SupportView({ title, intro, onBack, children }: { title: string; intro?: string; onBack(): void; children: ReactNode }) {
  return <main className="support-view" aria-labelledby="view-title">
    <button className="text-button back-button" onClick={onBack}><Icon name="arrow" />Terug</button>
    <h1 id="view-title" tabIndex={-1}>{title}</h1>
    {intro && <p className="support-intro">{intro}</p>}
    <div className="support-body">{children}</div>
  </main>;
}
