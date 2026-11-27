import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { NAV_ITEMS, type NavItemConfig } from "./navConfig";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { t, postureScore, metrics } = useApp();

  const groups: Array<{ key: NavItemConfig["group"]; label: string }> = [
    { key: "overview", label: t.nav.overviewGroup },
    { key: "tools", label: t.nav.toolsGroup },
    { key: "learning", label: t.nav.learningGroup },
    { key: "system", label: t.nav.systemGroup },
  ];

  return (
    <aside
      className={cn(
        "no-print hidden lg:flex flex-col border-r border-border/80 bg-card/75 backdrop-blur-xl transition-all duration-300 shrink-0 sticky top-0 h-screen z-30",
        collapsed ? "w-[78px]" : "w-[272px]"
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/70">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-slate-950 shadow-md shadow-sky-500/20">
            <Shield className="h-5 w-5 stroke-[2.4]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight leading-none">
                {t.brand.name}
              </p>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1 truncate">
                {t.brand.localBadge}
              </p>
            </div>
          )}
        </NavLink>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
          className="h-7 w-7 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((item) => item.group === group.key);
          return (
            <div key={group.key} className="space-y-0.5">
              {!collapsed && (
                <p className="px-2.5 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/75">
                  {group.label}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={collapsed ? t.nav[item.labelKey] : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105",
                            isActive ? "text-primary" : item.accentColor
                          )}
                        />
                        {!collapsed && (
                          <span className="truncate">{t.nav[item.labelKey]}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Posture summary footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border/70">
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">{t.dashboard.postureTitle}</span>
              <span className="font-mono font-bold text-emerald-500">{postureScore}%</span>
            </div>
            <Progress value={postureScore} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t.common.xp}:</span>
              <span className="font-mono font-semibold text-sky-400">{metrics.xp} XP</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
