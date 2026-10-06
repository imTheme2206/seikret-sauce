type DecorationSlotIconProps = {
  level: number;
  size?: number;
  decorative?: boolean;
};

/** Empty 33 × 30 frames from https://mhwildshub.com/sprites/slots.png. */
export const DecorationSlotIcon = ({
  level,
  size = 20,
  decorative = false,
}: DecorationSlotIconProps) => {
  const scale = size / 30;

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `Level ${level} decoration slot`}
      aria-hidden={decorative || undefined}
      className="inline-block shrink-0"
      style={{
        width: 33 * scale,
        height: size,
        backgroundImage: "url('/images/decoration-slots-sprite.png')",
        backgroundSize: `${660 * scale}px ${840 * scale}px`,
        backgroundPosition: `${-165 * (level - 1) * scale}px 0`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};
