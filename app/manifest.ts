import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/ler-depois",
    name: "Fora da Pauta",
    short_name: "Fora da Pauta",
    description:
      "Guarde páginas do Fora da Pauta para ler depois.",
    start_url: "/ler-depois",
    scope: "/",
    display: "standalone",
    background_color: "#eeeee9",
    theme_color: "#eeeee9",
    icons: [
      {
        src: "/ler-depois-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ler-depois-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}