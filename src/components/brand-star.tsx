/** Brand star used in the header and the empty state. */
export function BrandStar({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
    >
      <polygon
        points="11,2 12.5,8.2 19,8.2 13.8,12 16,18.5 11,14.5 6,18.5 8.2,12 3,8.2 9.5,8.2"
        fill="currentColor"
      />
    </svg>
  );
}
