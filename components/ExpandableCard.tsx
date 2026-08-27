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
  const marker = "**sem redução de salário**";

  if (!paragraph.includes(marker)) {
    return paragraph;
  }

  const [before, after] = paragraph.split(marker);

  return (
    <>
      {before}
      <strong className="font-semibold text-black">
        sem redução de salário
      </strong>
      {after}
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
    <details className="group overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] open:shadow-[0_24px_80px_rgba(0,0,0,0.09)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-7 marker:content-none sm:px-8 sm:py-8">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            {title}
          </h2>
        </div>

        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-[#f2f2ef] text-2xl font-light transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="border-t border-black/8 px-6 pb-8 pt-6 sm:px-8 sm:pb-9">
        <div className="space-y-5 text-[17px] leading-8 text-black/65 sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{renderParagraph(paragraph)}</p>
          ))}
        </div>

        {references?.length ? (
          <div className="mt-7 border-t border-black/10 pt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">
              Fontes
            </p>

            <div className="space-y-2">
              {references.map((reference) => (
                <a
                  key={reference.url}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-medium leading-6 text-black/60 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
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
