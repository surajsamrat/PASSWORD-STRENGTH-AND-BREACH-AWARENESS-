import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "blue" | "emerald" | "amber" | "rose";
  badge?: React.ReactNode;
}

const accentMap = {
  blue: "bg-sky-500/12 text-sky-500 border-sky-500/25",
  emerald: "bg-emerald-500/12 text-emerald-500 border-emerald-500/25",
  amber: "bg-amber-500/12 text-amber-500 border-amber-500/25",
  rose: "bg-rose-500/12 text-rose-500 border-rose-500/25",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  hint,
  icon: Icon,
  accent = "blue",
  badge,
}) => {
  return (
    <Card className="hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono tracking-tight">{value}</span>
              {badge}
            </div>
            {hint && <p className="text-xs text-muted-foreground pt-0.5">{hint}</p>}
          </div>
          <div className={cn("rounded-xl border p-2.5", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
