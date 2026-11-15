import type { SVGProps } from "react";

/** Dois traços da nova marca, nas proporções da imagem oficial. */
export function TracosMarca({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1000 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M 12 10 H 995 L 965 50 H 0 Z" fill="#FFFFFF" />
      <path d="M 12 79 H 516 L 487 119 H 0 Z" fill="#FFE000" />
    </svg>
  );
}
