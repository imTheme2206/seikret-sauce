import { DEFENSE_ICON, type ElementConfig } from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";

type StatIconProps = {
  className?: string;
  /** Leave unset when a visible label sits next to the icon. */
  label?: string;
};

/** In-game element glyph (fire / water / thunder / ice / dragon). */
export const ElementIcon = ({
  element,
  className,
  label,
}: StatIconProps & { element: ElementConfig }) => (
  <img
    src={element.icon}
    alt={label ?? ""}
    aria-hidden={label ? undefined : true}
    className={cn("size-4 shrink-0 object-contain", className)}
  />
);

/** In-game defense shield. */
export const DefenseIcon = ({ className, label }: StatIconProps) => (
  <img
    src={DEFENSE_ICON}
    alt={label ?? ""}
    aria-hidden={label ? undefined : true}
    className={cn("size-4 shrink-0 object-contain", className)}
  />
);
