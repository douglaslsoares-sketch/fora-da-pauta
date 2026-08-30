type ExpandableCardProps = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  references?: {
    label: string;
    url: string;
  }[];
};

function renderParagraph(paragraph: string) {
  const partes =
    paragraph.split(/(\*\*.+?\*\*)/g);

  return (
    <>
      {partes.map((parte, index) => {
        const ehNegrito =
          parte.startsWith("**") &&
          parte.endsWith("**");

        if (!ehNegrito) {
          return parte;
        }

        return (
          <strong
            key={index}
            className="font-semibold text-black"
          >
            {parte.slice(2, -2)}
          </strong>
        );
      })}
    </>
  );
}

export function ExpandableCard({
  eyebrow,
  title,
  paragraphs,
  references,
}: ExpandableCardProps) {
  return (
    <details className="group border-t border-black/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 marker:content-none sm:py-9">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="max-w-2xl text-2xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-3xl">
            {title}
          </h2>
        </div>

        <span
          aria-hidden="true"
          className="shrink-0 text-3xl font-light leading-none transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="pb-9 sm:pb-11">
        <div className="max-w-2xl space-y-5 text-[17px] leading-8 text-black/60 sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>
              {renderParagraph(paragraph)}
            </p>
          ))}
        </div>

        {references?.length ? (
          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">
              Fontes
            </p>

            <div className="space-y-3">
              {references.map((reference) => (
                <a
                  key={reference.url}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block max-w-2xl text-sm font-medium leading-6 text-black/55 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
                >
                  {reference.label} ↗
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}