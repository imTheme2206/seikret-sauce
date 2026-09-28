import { Typography } from "@/components/ui/typography";

/** Small heading used above a group of gear or skill details. */
export const SectionHeading = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      as="h4"
      className="mb-2 border-b border-border pb-2 text-sm font-medium text-foreground"
    >
      {children}
    </Typography>
  );
};
