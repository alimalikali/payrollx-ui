import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapProps {
  data: {
    date: string;
    status: "present" | "absent" | "late" | "leave" | "weekend" | "holiday";
  }[];
  month?: Date;
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  present: "bg-success",
  absent: "bg-danger",
  late: "bg-warning",
  leave: "bg-info",
  weekend: "bg-muted",
  holiday: "bg-muted",
};

const statusLabels = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  leave: "On Leave",
  weekend: "Weekend",
  holiday: "Holiday",
};

export function AttendanceHeatmap({ data, month = new Date(), size = "md" }: HeatmapProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = getDay(monthStart);

  // Create empty cells for padding
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const cellSize = {
    sm: "h-6 w-6",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-2">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-xs text-muted-foreground text-center font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className={cn(cellSize[size])} />
        ))}
        {days.map((day) => {
          const dayData = data.find((d) =>
            isSameDay(new Date(d.date), day)
          );
          const status = dayData?.status || "weekend";
          const isCurrentDay = isToday(day);

          return (
            <Tooltip key={day.toISOString()}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    cellSize[size],
                    "rounded-md cursor-pointer transition-all duration-150 hover:scale-105 flex items-center justify-center text-xs font-medium",
                    statusColors[status],
                    isCurrentDay && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                  )}
                >
                  {format(day, "d")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                <p className="text-muted-foreground">{statusLabels[status]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className={cn(
                "h-3 w-3 rounded-sm",
                statusColors[key as keyof typeof statusColors]
              )}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
