import logoIcon from "@/assets/icons/logo.png";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-subtle bg-surface px-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center">
          <img src={logoIcon} alt="Barobar Logo" className="h-9 w-8" />
        </span>

        <div className="flex flex-col">
          <p className="text-lg font-extrabold leading-none text-primary">바로바 모니터링</p>
          <p className="mt-1 text-xs font-medium text-text-subtle">Replay-based</p>
        </div>
      </div>
    </header>
  );
}
