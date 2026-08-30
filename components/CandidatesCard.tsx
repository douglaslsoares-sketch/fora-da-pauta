import Link from "next/link";

type CandidatesCardProps = {
  href: string;
};

export function CandidatesCard({
  href,
}: CandidatesCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-end justify-between gap-8 border-t border-black/15 py-8 sm:py-10"
    >
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Eleições 2026
        </p>

        <h2 className="max-w-xl text-2xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-3xl">
          Quem se posicionou sobre esta pauta?
        </h2>

        <p className="mt-4 max-w-xl text-base leading-7 text-black/55">
          Veja candidaturas com posicionamento público documentado sobre esta pauta.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="shrink-0 text-2xl transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}