import { cn } from "@/lib/utils";
import type { SkillCategory } from "./skill-catalog";

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  armor: "var(--category-armor)",
  weapon: "var(--category-weapon)",
  set: "var(--category-set)",
  group: "var(--category-group)",
};

type SkillGlyphProps = {
  icon: string | null;
  category: SkillCategory;
  label?: string;
  className?: string;
};

/** Catalog icon with one asset convention and category-aware fallback. */
export const SkillGlyph = ({
  icon,
  category,
  label = `${category} skill`,
  className,
}: SkillGlyphProps) => {
  if (icon) {
    return (
      <img
        src={`/images/icons/${icon}.png`}
        alt={label}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  if (category === "set") {
    return (
      <img
        src="/images/icons/set.png"
        alt={label}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  const color = CATEGORY_COLORS[category];
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-label={label}
      role="img"
      className={cn("shrink-0", className)}
    >
      {category === "armor" && (
        <path
          d="M8 2L13 4.5V9.5C13 12 10.5 13.8 8 15C5.5 13.8 3 12 3 9.5V4.5Z"
          stroke={color}
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill={color}
          fillOpacity="0.18"
        />
      )}
      {category === "weapon" && (
        <>
          <line
            x1="11"
            y1="3"
            x2="5"
            y2="13"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9.5"
            y1="5"
            x2="7"
            y2="7.5"
            stroke={color}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </>
      )}
      {category === "group" && (
        <>
          <circle cx="5.5" cy="8" r="3" stroke={color} strokeWidth="1.3" />
          <circle cx="10.5" cy="8" r="3" stroke={color} strokeWidth="1.3" />
        </>
      )}
    </svg>
  );
};
