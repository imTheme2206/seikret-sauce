import * as React from "react";

import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  /** Override the rendered element (defaults to `p`). */
  as?: React.ElementType;
};

/**
 * The single text primitive for the app. Route all rendered copy through this
 * instead of raw `<p>`/`<span>`/`<h*>` tags. It sets one consistent font;
 * size, colour and weight are passed via `className`.
 */
function Typography({ className, as, ...props }: TypographyProps) {
  const Comp = as ?? "p";
  return (
    <Comp
      data-slot="typography"
      className={cn("font-sans", className)}
      {...props}
    />
  );
}

export { Typography };
