import { SHARPNESS_SEGMENTS } from "../config";
import type { Weapon } from "../types";

/** Sharpness is measured against a 400-point bar in game. */
const BAR_TOTAL = 400;

type SharpnessBarProps = {
  sharpness: NonNullable<Weapon["sharpness"]>;
};

/** Melee sharpness as colour segments sized by their length, like the in-game gauge. */
export const SharpnessBar = ({ sharpness }: SharpnessBarProps) => {
  const label = SHARPNESS_SEGMENTS.filter(
    (segment) => sharpness[segment.key] > 0,
  )
    .map((segment) => `${segment.key} ${sharpness[segment.key]}`)
    .join(", ");

  return (
    <div
      role="img"
      aria-label={`Sharpness: ${label}`}
      title={label}
      className="flex h-2.5 w-full max-w-64 overflow-hidden rounded-sm border border-border bg-background/60"
    >
      {SHARPNESS_SEGMENTS.map((segment) =>
        sharpness[segment.key] > 0 ? (
          <span
            key={segment.key}
            className="h-full"
            style={{
              width: `${(sharpness[segment.key] / BAR_TOTAL) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ) : null,
      )}
    </div>
  );
};
