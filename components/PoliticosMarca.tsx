import type { SVGProps } from "react";

/** Símbolo do aplicativo Políticos, recuperado do protótipo original. */
export function PoliticosMarca(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 94" fill="none" role="img" aria-label="Olho com três pessoas" {...props}>
      <path d="M10 26 Q60 -5 110 26" stroke="#ffd02a" strokeWidth="8" strokeLinecap="round" />
      <defs><clipPath id="politicos-olho-interior"><path d="M8 57 Q60 5 112 57 Q60 107 8 57Z" /></clipPath></defs>
      <g clipPath="url(#politicos-olho-interior)">
        <circle cx="60" cy="43" r="11" fill="#f5f8fc" />
        <circle cx="34" cy="53" r="8" fill="#f5f8fc" />
        <circle cx="86" cy="53" r="8" fill="#f5f8fc" />
        <path d="M19 79 Q19 61 34 61 Q47 61 47 79Z" fill="#f5f8fc" />
        <path d="M73 79 Q73 61 86 61 Q101 61 101 79Z" fill="#f5f8fc" />
        <path d="M37 86 Q37 58 60 58 Q83 58 83 86Z" fill="#ffd02a" />
      </g>
      <path d="M8 57 Q60 5 112 57 Q60 107 8 57Z" stroke="#f5f8fc" strokeWidth="7" strokeLinejoin="round" />
    </svg>
  );
}
