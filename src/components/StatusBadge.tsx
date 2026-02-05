import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
  {
    variants: {
      variant: {
        success: "bg-success-dim text-success-foreground",
        warning: "bg-warning-dim text-warning-foreground",
        danger: "bg-danger-dim text-danger-foreground",
        info: "bg-info-dim text-info-foreground",
        neutral: "bg-muted text-muted-foreground",
        primary: "bg-primary-dim text-primary-text",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}
