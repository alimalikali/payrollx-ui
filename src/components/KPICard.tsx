import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  prefix?: string;
}

export function KPICard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  prefix,
}: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 transition-all duration-200 hover:border-border-hover">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary-dim">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendUp ? "text-success-foreground" : "text-danger-foreground"
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text-sm text-muted-foreground">{prefix}</span>
          )}
          <span className="text-3xl font-bold text-foreground">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
