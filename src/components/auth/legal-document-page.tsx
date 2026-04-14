import { Link } from '@/i18n/routing';

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentPageProps = {
  title: string;
  updatedAt: string;
  intro: string;
  backLabel: string;
  sections: LegalSection[];
};

export function LegalDocumentPage({
  title,
  updatedAt,
  intro,
  backLabel,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="bg-gray-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{updatedAt}</p>
        <p className="mt-6 text-base leading-7 text-slate-700">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section, sectionIndex) => (
            <section key={`${sectionIndex}-${section.title}`}>
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={`${sectionIndex}-${paragraphIndex}`}
                    className="text-base leading-7 text-slate-700"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
