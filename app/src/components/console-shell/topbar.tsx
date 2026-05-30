export function TopBar({ section }: { section?: string }) {
  return (
    <header
      data-testid="console-topbar"
      className="flex h-14 items-center justify-between border-b border-rule bg-paper px-8"
    >
      <div className="flex items-center gap-3 text-[12.5px] text-mute">
        <span>Connecting Traveller</span>
        {section ? (
          <>
            <span aria-hidden className="text-rule">
              ›
            </span>
            <span className="text-ink">{section}</span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-[12.5px] text-mute">
        <span className="rounded-full border border-rule px-2.5 py-1">
          Mock data · v1
        </span>
      </div>
    </header>
  );
}
