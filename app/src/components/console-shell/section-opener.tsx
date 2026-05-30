type SectionOpenerProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function SectionOpener({ eyebrow, title, description }: SectionOpenerProps) {
  return (
    <header className="max-w-2xl">
      {eyebrow ? (
        <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-mute">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="font-display text-[44px] leading-[1.05] tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mute">{description}</p>
    </header>
  );
}
