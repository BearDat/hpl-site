export function TeamCrest({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 28 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2 L26 7 V16 C26 24 20 29 14 30 C8 29 2 24 2 16 V7 Z"
        fill={color}
        stroke="#101b45"
        strokeWidth="2"
      />
    </svg>
  );
}
