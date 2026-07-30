/**
 * Skill-category SVG icons for the Loadout Optimizer.
 *
 * Each icon is a pure presentational component driven entirely by props,
 * keeping icon-drawing concerns out of the layout components (SRP). The
 * equipment-position glyph is shared with the Builds feature and lives in
 * `@/components/gear/slot-icon`.
 */

import type { SkillCategory } from "./types";

interface TypeIconProps {
  category: SkillCategory;
  color: string;
  size?: number;
  icon?: string | null;
}

/** Category glyph shown beside a skill name. */
export function TypeIcon({ category, color, size = 14, icon }: TypeIconProps) {
  if (icon) {
    return <img src={`/images/icons/${icon}.png`} alt={category} />;
  }

  if (category === "set") {
    return <img src={"/images/icons/set.png"} alt="set" />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="block shrink-0"
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
          <circle
            cx="5.5"
            cy="8"
            r="3"
            stroke={color}
            strokeWidth="1.3"
            fill="none"
          />
          <circle
            cx="10.5"
            cy="8"
            r="3"
            stroke={color}
            strokeWidth="1.3"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
