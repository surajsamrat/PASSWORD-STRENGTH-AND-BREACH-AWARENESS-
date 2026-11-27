import React from "react";
import { NavLink } from "react-router-dom";
import { Shield, X } from "lucide-react";
import { NAV_ITEMS, type NavItemConfig } from "./navConfig";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ open, onClose }) => {
  const { t, postureScore, metrics } = useApp();

  const groups: Array<{ key: NavItemConfig["group"]; label: string }> = [
    { key: "overview", label: t.nav.overviewGroup },
    { key: "tools", label: t.nav.toolsGroup },
    { key: "learning", label: t.nav.learningGroup },
    { key: "system", label: t.nav.systemGroup },
  ];

  const bottomQuickRoutes = NAV_ITEMS.filter((i) =>
    ["dashboard", "analyzer", "generator", "breach", "quiz"].includes(i.id)
  );

  return (
    <>
      {/* Slide-over drawer for mobile & tablet */}
      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 px-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-slate-950">
                  <Shield className="h-4 w-4 stroke-[2.4]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold leading-none">{t.brand.name}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                    {postureScore}% • {metrics.xp} XP
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-5">
              {groups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </p>
                  {NAV_ITEMS.filter((item) => item.group === group.key).map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary/15 text-primary border border-primary/25"
                              : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                          )
                        }
                      >
                        <Icon className={cn("h-4 w-4", item.accentColor)} />
                        <span>{t.nav[item.labelKey]}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom quick navigation bar */}
      <nav className="no-print fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-border/80 bg-card/95 backdrop-blur-xl px-1 py-1.5 flex items-center justify-around">
        {bottomQuickRoutes.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors min-w-[56px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[64px]">{t.nav[item.labelKey]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
