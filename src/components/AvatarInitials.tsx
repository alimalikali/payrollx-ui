import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAssetUrl } from "@/lib/api";

interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageUrl?: string | null;
}

export function AvatarInitials({ name, size = "md", className, imageUrl }: AvatarInitialsProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  // Generate a consistent color based on name
  const colors = [
    "bg-primary-dim text-primary-text",
    "bg-success-dim text-success-foreground",
    "bg-warning-dim text-warning-foreground",
    "bg-info-dim text-info-foreground",
    "bg-danger-dim text-danger-foreground",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const resolvedImageUrl = getAssetUrl(imageUrl);

  return (
    <Avatar
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )}
    >
      {resolvedImageUrl ? <AvatarImage src={resolvedImageUrl} alt={name} /> : null}
      <AvatarFallback className={cn("font-semibold", colors[colorIndex])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
