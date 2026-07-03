/** Small uppercase heading used inside an expanded result row. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b border-border pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}
