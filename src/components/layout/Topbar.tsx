import React from "react";
import { useLocation } from "react-router-dom";
import { Languages, Lock, Menu, Moon, Shield, Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NAV_ITEMS } from "./navConfig";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme, language, setLanguage, t, settings } = useApp();
  const location = useLocation();

  const currentNav =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) || NAV_ITEMS[0];

  return (
    <header className="no-print sticky top-0 z-20 h-16 border-b border-border/80 bg-background/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-slate-950">
            <Shield className="h-4 w-4 stroke-[2.4]" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold truncate">
              {t.nav[currentNav.labelKey]}
            </span>
            <Badge variant="emerald" className="hidden md:inline-flex text-[10px]">
              <Lock className="h-2.5 w-2.5" />
              {t.common.liveLocal}
            </Badge>
          </div>
          <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
            {t.brand.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Language Toggle EN / HI */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="gap-1.5 font-semibold"
          title={t.common.language}
        >
          <Languages className="h-4 w-4 text-sky-500" />
          <span className="text-xs">{language === "en" ? "EN / हिं" : "हिं / EN"}</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t.common.lightMode : t.common.darkMode}
          title={theme === "dark" ? t.common.lightMode : t.common.darkMode}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600" />
          )}
        </Button>

        {/* Operator pill */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold max-w-[140px] truncate">
            {settings.displayName}
          </span>
        </div>
      </div>
    </header>
  );
};
