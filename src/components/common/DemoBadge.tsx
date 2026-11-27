import React from "react";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

export const DemoBadge: React.FC<{ label?: string }> = ({ label }) => {
  const { t } = useApp();
  return (
    <Badge variant="amber" className="font-mono uppercase tracking-wide text-[10px]">
      <FlaskConical className="h-3 w-3" />
      {label ?? t.common.demoData}
    </Badge>
  );
};
