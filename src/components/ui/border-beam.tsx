import { useId } from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
}

export function BorderBeam({
  className,
  borderWidth = 2,
  colorFrom = "#2563eb", // Solid Royal Blue
  colorTo = "transparent",
  duration = 8,
}: BorderBeamProps) {
  const gradientId = useId();

  return (
    <div className={cn("absolute inset-0 pointer-events-none rounded-[inherit]", className)}>
      <svg className="w-full h-full rounded-[inherit]" fill="none">
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={`calc(100% - ${borderWidth}px)`}
          height={`calc(100% - ${borderWidth}px)`}
          rx="inherit"
          ry="inherit"
          stroke={`url(#${gradientId})`}
          strokeWidth={borderWidth}
          style={{
            strokeDasharray: "150 400",
            animation: `border-beam-svg-anim ${duration}s linear infinite`,
          }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
