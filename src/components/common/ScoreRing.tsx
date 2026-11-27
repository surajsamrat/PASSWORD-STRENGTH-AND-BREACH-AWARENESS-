import React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  tone?: "auto" | "blue" | "emerald" | "amber" | "red";
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  value,
  size = 136,
  strokeWidth = 10,
  label,
  sublabel,
  tone = "auto",
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  let strokeColor = "stroke-sky-500";
  if (tone === "emerald") strokeColor = "stroke-emerald-500";
  else if (tone === "amber") strokeColor = "stroke-amber-500";
  else if (tone === "red") strokeColor = "stroke-rose-500";
  else if (tone === "auto") {
    if (clamped >= 75) strokeColor = "stroke-emerald-500";
    else if (clamped >= 45) strokeColor = "stroke-sky-500";
    else if (clamped >= 25) strokeColor = "stroke-amber-500";
    else strokeColor = "stroke-rose-500";
  }

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-secondary/80"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", strokeColor)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
          {label ?? `${clamped}`}
        </span>
        {sublabel && (
          <span className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
