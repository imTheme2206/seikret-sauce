/**
 * Self-contained SVG icon components for the Loadout Optimizer.
 *
 * Each icon is a pure presentational component driven entirely by props,
 * keeping icon-drawing concerns out of the layout components (SRP).
 */

import ArmsSVG from "@/svg/ArmsSvg";
import ChestSVG from "@/svg/ChestSvg";
import HeadSVG from "@/svg/HeadSvg";
import LegsSVG from "@/svg/LegsSvg";
import TalismanSVG from "@/svg/TalismanSvg";
import WaistSVG from "@/svg/WaistSvg";
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

interface SlotIconProps {
  index: number;
  color: string;
  size?: number;
}

/** Armour-slot glyph (head / chest / arms / waist / legs / charm) by index. */
export function SlotIcon({ index, color, size = 11 }: SlotIconProps) {
  const sw = "1.4";
  const slots = [
    <HeadSVG color={color} />,
    <ChestSVG color={color} />,
    <ArmsSVG color={color} />,
    <WaistSVG color={color} />,
    <LegsSVG color={color} />,
    <TalismanSVG color={color} />,
  ];

  return (
    <span className="block shrink-0" style={{ width: size, height: size }}>
      {slots[index] ?? slots[0]}
    </span>
  );
}
