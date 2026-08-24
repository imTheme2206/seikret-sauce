import type { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type PanelHeadingProps = {
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
};

/** Quiet heading used at the top of a panel or stat block. */
export const PanelHeading = ({
  icon: Icon,
  className,
  children,
}: PanelHeadingProps) => {
  return (
    <Typography
      as="div"
      className={cn(
        "mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-primary" />}
      {children}
    </Typography>
  );
};
