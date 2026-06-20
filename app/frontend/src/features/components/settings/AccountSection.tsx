import { useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./SettingsSection";

export function AccountSection() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [revoking, setRevoking] = useState(false);

  if (!isLoaded || !user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? "—";

  const handleSignOutEverywhere = async () => {
    setRevoking(true);
    try {
      const sessions = await user.getSessions();
      // Revoke every other active session, then sign out from this one.
      await Promise.all(
        sessions
          .filter((s) => s.status === "active")
          .map((s) => s.revoke().catch(() => null)),
      );
      toast.success("Signed out everywhere");
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign-out-everywhere failed", error);
      toast.error("Could not sign out from all devices.");
      setRevoking(false);
    }
  };

  return (
    <SettingsSection
      title="Account"
      description="Your primary email and session controls."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Email</p>
            <p className="font-data text-sm">{email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOutEverywhere}
            disabled={revoking}
            className="gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400"
          >
            {revoking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldAlert className="size-4" />
            )}
            Sign out from all devices
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
