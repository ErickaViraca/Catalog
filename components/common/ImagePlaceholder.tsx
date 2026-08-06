interface ImagePlaceholderProps {
  size?: number;
  className?: string;
}

export function ImagePlaceholder({ size = 64, className = "" }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-400 rounded-lg shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}
