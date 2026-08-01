interface XiaomiLogoProps {
  size?: number;
  className?: string;
}

export function XiaomiLogo({ size = 32, className = "" }: XiaomiLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Xiaomi"
    >
      <rect width="32" height="32" rx="8" fill="#FF6900" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="15"
        fill="#FFFFFF"
      >
        Mi
      </text>
    </svg>
  );
}
