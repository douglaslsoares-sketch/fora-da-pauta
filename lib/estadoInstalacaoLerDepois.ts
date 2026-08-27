export const LER_DEPOIS_INSTALACAO_EVENT =
  "fora-da-pauta:ler-depois-instalacao-alterada";

const INSTALADO_KEY =
  "fora-da-pauta:ler-depois:instalado:v1";

const ORIENTACAO_VISTA_KEY =
  "fora-da-pauta:ler-depois:orientacao-vista:v1";

type NavigatorComInstalacao = Navigator & {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<
    Array<{
      platform?: string;
      url?: string;
      id?: string;
    }>
  >;
};

function confirmarLocalmente() {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        INSTALADO_KEY,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function estaExecutandoComoLerDepois() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return false;
  }

  const navegador =
    navigator as NavigatorComInstalacao;

  return (
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    navegador.standalone === true
  );
}

export function marcarLerDepoisComoInstalado() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  let precisaAvisar = true;

  try {
    precisaAvisar =
      window.localStorage.getItem(
        INSTALADO_KEY,
      ) !== "1";

    window.localStorage.setItem(
      INSTALADO_KEY,
      "1",
    );
  } catch {
    // O estado desta sessão ainda pode ser atualizado.
  }

  if (precisaAvisar) {
    window.dispatchEvent(
      new Event(
        LER_DEPOIS_INSTALACAO_EVENT,
      ),
    );
  }
}

export function desmarcarLerDepoisComoInstalado() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  let estavaMarcado = false;

  try {
    estavaMarcado =
      window.localStorage.getItem(
        INSTALADO_KEY,
      ) === "1";

    window.localStorage.removeItem(
      INSTALADO_KEY,
    );

    window.localStorage.removeItem(
      ORIENTACAO_VISTA_KEY,
    );
  } catch {
    // Continua normalmente.
  }

  if (estavaMarcado) {
    window.dispatchEvent(
      new Event(
        LER_DEPOIS_INSTALACAO_EVENT,
      ),
    );
  }
}

export function orientacaoDeInstalacaoJaFoiMostrada() {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        ORIENTACAO_VISTA_KEY,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function marcarOrientacaoDeInstalacaoComoMostrada() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      ORIENTACAO_VISTA_KEY,
      "1",
    );
  } catch {
    // Continua normalmente.
  }
}

export async function consultarSeLerDepoisEstaInstalado() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return false;
  }

  if (estaExecutandoComoLerDepois()) {
    marcarLerDepoisComoInstalado();
    return true;
  }

  const navegador =
    navigator as NavigatorComInstalacao;

  if (
    typeof navegador.getInstalledRelatedApps ===
    "function"
  ) {
    try {
      const aplicativos =
        await navegador.getInstalledRelatedApps();

      const instalado =
        aplicativos.length > 0;

      if (instalado) {
        marcarLerDepoisComoInstalado();
      } else {
        desmarcarLerDepoisComoInstalado();
      }

      return instalado;
    } catch {
      // Cai para a confirmação local.
    }
  }

  return confirmarLocalmente();
}