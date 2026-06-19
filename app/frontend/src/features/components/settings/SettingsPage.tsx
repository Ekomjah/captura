import { AppearanceSection } from "./AppearanceSection";
import { ProfileSection } from "./ProfileSection";

export function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Account
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tune Captura to fit how you work.
        </p>
      </header>

      <div className="space-y-5">
        <ProfileSection />
        <AppearanceSection />
      </div>
    </div>
  );
}
