export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 46"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="54" height="44" rx="12" fill="#101b45" />
      <path
        d="M1 13 C1 6.4 6.4 1 13 1 H23 V45 H13 C6.4 45 1 39.6 1 33 Z"
        fill="#1657ff"
      />
      <path
        d="M23 45 C34 40 30 30 40 27 C46 25 48 20 47 14"
        stroke="#f2f4fa"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M31 9.5 L32.6 13.4 L36.8 13.7 L33.6 16.4 L34.6 20.5 L31 18.2 L27.4 20.5 L28.4 16.4 L25.2 13.7 L29.4 13.4 Z"
        fill="#f2f4fa"
      />
    </svg>
  );
}
