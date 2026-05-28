import logoIcon from "@/assets/icons/logo.png";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-subtle bg-white">
      <div className="mx-auto flex h-full w-fullitems-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center bg-surface ml-3">
            <img src={logoIcon} alt="Barobar Logo" className="w-8 h-9" />
          </span>

          <div className="flex flex-col pl-2">
            <p className="text-lg font-extrabold leading-none text-primary">바로바 모니터링</p>
            <p className="mt-1 text-xs text-text-subtle">Replay-based</p>
          </div>
        </div>
      </div>
    </header>
  );
}
