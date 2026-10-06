import { Typography } from "@/components/ui/typography";
import type { LucideIcon } from "lucide-react";

type BuildStatusTagProps = {
  icon: LucideIcon;
  label: string;
  tone: "warning" | "primary";
};

/** Shared status label for compact and expanded build cards. */
export const BuildStatusTag = ({
  icon: Icon,
  label,
  tone,
}: BuildStatusTagProps) => {
  return (
    <Typography
      as="span"
      className={
        tone === "warning"
          ? "flex items-center gap-1 border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] uppercase tracking-widest text-warning"
          : "flex items-center gap-1 border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-widest text-primary"
      }
    >
      <Icon className="size-3" /> {label}
    </Typography>
  );
};
