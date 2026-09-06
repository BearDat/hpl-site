import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="HCBB Pathway"
      width={1231}
      height={694}
      priority
      className={className}
    />
  );
}
