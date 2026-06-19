import { useRef, useState } from "react";
import { useUser } from "@clerk/react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/UserAvatar";
import { SettingsSection } from "./SettingsSection";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function ProfileSection() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(() => user?.firstName ?? "");
  const [lastName, setLastName] = useState(() => user?.lastName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!isLoaded || !user) {
    return (
      <SettingsSection title="Profile" description="Loading your profile…">
        <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
      </SettingsSection>
    );
  }

  const dirty =
    firstName !== (user.firstName ?? "") || lastName !== (user.lastName ?? "");

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await user.update({ firstName, lastName });
      toast.success("Profile updated");
    } catch (error) {
      console.error("Profile update failed", error);
      toast.error("Could not update profile. Try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setUploadingAvatar(true);
    try {
      await user.setProfileImage({ file });
      toast.success("Profile picture updated");
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error("Could not update profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <SettingsSection
      title="Profile"
      description="Your name and picture appear in the sidebar and top bar."
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <UserAvatar sizeClass="size-20" />
            {uploadingAvatar && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
                <Loader2 className="size-5 animate-spin text-primary" />
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="gap-2"
          >
            <Camera className="size-4" />
            Change picture
          </Button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ada"
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Lovelace"
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveName}
              disabled={!dirty || savingName}
            >
              {savingName ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
