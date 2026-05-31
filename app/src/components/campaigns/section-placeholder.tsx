export function SectionPlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-rule bg-panel px-5 py-6 text-center">
      <div className="text-[13px] font-medium text-ink">{title}</div>
      <div className="mt-1 text-[12px] text-mute">Coming in {phase}.</div>
    </div>
  );
}
