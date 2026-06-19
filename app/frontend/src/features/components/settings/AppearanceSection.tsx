import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { SettingsSection } from "./SettingsSection";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection
      title="Appearance"
      description="Pick the theme used across Captura. System follows your OS preference."
    >
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <Button
              key={value}
              type="button"
              variant="outline"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={cn(
                "flex h-auto flex-col gap-1.5 rounded-xl py-3 transition-colors",
                active
                  ? "border-primary/60 bg-primary/10 text-primary hover:bg-primary/15"
                  : "hover:bg-muted",
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
