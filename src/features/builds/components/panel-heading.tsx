import type { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type PanelHeadingProps = {
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
};

/** Accented, letter-spaced heading used at the top of a panel or stat block. */
export const PanelHeading = ({
  icon: Icon,
  className,
  children,
}: PanelHeadingProps) => {
  return (
    <Typography
      as="div"
      className={cn(
        "mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-primary",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </Typography>
  );
};
