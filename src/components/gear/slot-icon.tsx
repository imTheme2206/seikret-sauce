import ArmsSVG from "@/svg/ArmsSvg";
import ChestSVG from "@/svg/ChestSvg";
import HeadSVG from "@/svg/HeadSvg";
import LegsSVG from "@/svg/LegsSvg";
import TalismanSVG from "@/svg/TalismanSvg";
import WaistSVG from "@/svg/WaistSvg";
import type { EquipmentPosition } from "@/lib/mh-wilds";

const GLYPHS: Record<EquipmentPosition, (color: string) => React.ReactNode> = {
  head: (color) => <HeadSVG color={color} />,
  chest: (color) => <ChestSVG color={color} />,
  arms: (color) => <ArmsSVG color={color} />,
  waist: (color) => <WaistSVG color={color} />,
  legs: (color) => <LegsSVG color={color} />,
  talisman: (color) => <TalismanSVG color={color} />,
};

interface SlotIconProps {
  position: EquipmentPosition;
  color: string;
  size?: number;
}

/**
 * Equipment-position glyph (head / chest / arms / waist / legs / talisman),
 * shared by the Loadout Optimizer result chips and the Builds gear rows so a
 * position looks the same wherever it appears.
 */
export function SlotIcon({ position, color, size = 11 }: SlotIconProps) {
  return (
    <span className="block shrink-0" style={{ width: size, height: size }}>
      {GLYPHS[position](color)}
    </span>
  );
}
