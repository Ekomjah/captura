import { useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "./SettingsSection";

const CONFIRM_PHRASE = "D elete my account";

export function DangerZoneSection() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  if (!isLoaded || !user) return null;

  const canDelete = confirm.trim().toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await user.delete();
      toast.success("Account deleted");
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Account delete failed", error);
      toast.error("Could not delete account. Contact support.");
      setDeleting(false);
    }
  };

  return (
    <SettingsSection
      title="Danger zone"
      description="Irreversible actions. Read carefully before continuing."
      className="border-destructive/30 bg-destructive/5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Delete this account</p>
          <p className="text-xs text-muted-foreground">
            Permanently removes your Captura account and signs you out
            everywhere. Stored screenshots are retained according to the
            project's data policy.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setConfirm("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2 shrink-0">
              <Trash2 className="size-4" />
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account?</DialogTitle>
              <DialogDescription>
                This permanently removes your Captura sign-in. To confirm,
                type{" "}
                <span className="font-data text-foreground">
                  {CONFIRM_PHRASE}
                </span>{" "}
                below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Confirmation</Label>
              <Input
                id="delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canDelete || deleting}
                onClick={handleDelete}
                className="gap-2"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete forever
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsSection>
  );
}
