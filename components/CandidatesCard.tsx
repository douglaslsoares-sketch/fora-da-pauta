import Link from "next/link";

type CandidatesCardProps = {
  href: string;
};

export function CandidatesCard({ href }: CandidatesCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-6 rounded-[30px] border border-black/10 bg-white px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1 sm:px-8 sm:py-8"
    >
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
          Eleições 2026
        </p>

        <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Quem se posicionou sobre esta pauta?
        </h2>

        <p className="mt-3 max-w-lg text-base leading-7 text-black/55">
          Veja candidaturas com posicionamento público documentado sobre esta pauta.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-[#f2f2ef] text-xl transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
