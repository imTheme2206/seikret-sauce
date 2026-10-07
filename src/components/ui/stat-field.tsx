import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Typography } from "./typography";

type StatFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  valueClassName?: string;
};

/** One labelled value inside a description list. */
export const StatField = ({
  label,
  children,
  className,
  valueClassName,
}: StatFieldProps) => (
  <div className={className}>
    <Typography as="dt" className="text-xs text-muted-foreground">
      {label}
    </Typography>
    <Typography as="dd" className={cn(valueClassName)}>
      {children}
    </Typography>
  </div>
);
