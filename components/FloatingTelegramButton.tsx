export function FloatingTelegramButton() {
  return (
    <a
      href="https://t.me/foradapauta"
      target="_blank"
      rel="noreferrer"
      aria-label="Entrar no canal do Fora da Pauta no Telegram"
      title="Telegram"
      data-editorial-ignore
      className="fixed bottom-3 right-3 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-[#FFC400] text-black shadow-lg transition hover:-translate-y-0.5 hover:bg-[#e9b300] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:rounded-none sm:px-4 sm:py-3"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 sm:hidden"
        fill="currentColor"
      >
        <path d="M21.6 3.2 18.4 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 12.8 1.2 11.3c-1-.3-1-1 .2-1.5L20 2.6c.9-.3 1.8.2 1.6.6Z" />
      </svg>

      <span className="hidden text-sm font-semibold sm:inline">
        Telegram
      </span>

      <span
        aria-hidden="true"
        className="ml-2 hidden text-base leading-none sm:inline"
      >
        ↗
      </span>
    </a>
  );
}