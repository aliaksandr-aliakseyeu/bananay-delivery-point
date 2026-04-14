type SectionHeadingProps = {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeading({
  label,
  title,
  subtitle,
  className = 'max-w-3xl',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="section-eyebrow">{label}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg leading-8 text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}
