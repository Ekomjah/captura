import { useUser } from "@clerk/react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  /** Diameter token; defaults to `size-9`. */
  sizeClass?: string;
}

function getInitials(fullName: string | null | undefined, email: string): string {
  const source = (fullName ?? email).trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * Bare avatar derived from the signed-in Clerk user. Renders the remote image
 * with an initials fallback — does not include any popover or menu surface.
 */
export function UserAvatar({ className, sizeClass = "size-9" }: UserAvatarProps) {
  const { user } = useUser();
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = getInitials(user.fullName, email);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border/60 text-xs font-semibold text-muted-foreground",
        sizeClass,
        className,
      )}
      aria-label={user.fullName ?? email}
    >
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        initials
      )}
    </span>
  );
}
