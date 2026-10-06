import { SPRITE, spriteFrame, type DecorationColor } from "@/lib/decoration-sprite";

type DecorationSlotIconProps = {
  /** Socket size, 1–4. */
  level: number;
  /** The jewel seated in the socket; omit for an empty socket. */
  jewel?: { level: number; color: DecorationColor };
  size?: number;
  decorative?: boolean;
};

/**
 * A decoration socket from the in-game sprite, empty or holding a jewel drawn
 * in its real level and colour.
 */
export const DecorationSlotIcon = ({
  level,
  jewel,
  size = 20,
  decorative = false,
}: DecorationSlotIconProps) => {
  const scale = size / SPRITE.frameHeight;
  const frame = spriteFrame(level, jewel);
  const label = jewel
    ? `Level ${jewel.level} jewel in a level ${level} slot`
    : `Level ${level} decoration slot`;

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className="inline-block shrink-0"
      style={{
        width: SPRITE.frameWidth * scale,
        height: size,
        backgroundImage: "url('/images/decoration-slots-sprite.png')",
        backgroundSize: `${SPRITE.width * scale}px ${SPRITE.height * scale}px`,
        backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};
