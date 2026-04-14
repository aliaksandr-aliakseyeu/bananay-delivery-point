type LandingDividerProps = {
  tone?: 'white' | 'slate';
};

export function LandingDivider({ tone = 'white' }: LandingDividerProps) {
  const colorClass = tone === 'slate' ? 'bg-slate-50/70' : 'bg-white/55';

  return (
    <div className="relative h-0 overflow-visible" aria-hidden="true">
      <div className={`public-divider-glow ${colorClass}`} />
    </div>
  );
}
