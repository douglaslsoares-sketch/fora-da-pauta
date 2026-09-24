"use client";

import { useState } from "react";

type CandidatePhotoProps = {
  id: string;
  name: string;
  variant?: "thumbnail" | "profile";
};

function iniciais(name: string) {
  const partes = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "?";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function CandidatePhoto({
  id,
  name,
  variant = "thumbnail",
}: CandidatePhotoProps) {
  const [erro, setErro] = useState(false);

  const profile = variant === "profile";

  const largura = profile ? 126 : 64;
  const altura = profile ? 176 : 90;

  return (
    <div
      style={{
        flex: "0 0 auto",
        width: `${largura}px`,
        height: `${altura}px`,
        overflow: "hidden",
        border: profile
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(0,0,0,0.10)",
        background: profile
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.03)",
      }}
    >
      {!erro ? (
        <img
          src={`https://pub-2ff7d24c72ae4d739a71d60b1a26bb5e.r2.dev/candidatos/2026/${id}.jpg`}
          alt={`Foto de ${name}`}
          onError={() => setErro(true)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      ) : (
        <div
          aria-label={`Foto não disponível para ${name}`}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: profile ? "18px" : "14px",
            fontWeight: 600,
            color: profile
              ? "rgba(255,255,255,0.30)"
              : "rgba(0,0,0,0.25)",
          }}
        >
          {iniciais(name)}
        </div>
      )}
    </div>
  );
}