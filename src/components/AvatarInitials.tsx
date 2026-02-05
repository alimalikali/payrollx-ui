import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarInitials({ name, size = "md", className }: AvatarInitialsProps) {
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

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold",
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  );
}
