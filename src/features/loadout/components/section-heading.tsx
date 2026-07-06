import { Typography } from "@/components/ui/typography";

/** Small uppercase heading used inside an expanded result row. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      as="h4"
      className="mb-2 border-b border-border pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
    >
      {children}
    </Typography>
  );
}
