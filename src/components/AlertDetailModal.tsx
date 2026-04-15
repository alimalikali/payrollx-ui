import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { useUpdateAlertStatus, type AIAlert } from "@/hooks";
import { CheckCircle, Search, XCircle, ShieldAlert, Clock } from "lucide-react";

interface AlertDetailModalProps {
  alert: AIAlert | null;
  open: boolean;
  onClose: () => void;
}

const severityVariant = (s: string) => {
  if (s === "critical" || s === "high") return "danger" as const;
  if (s === "medium") return "warning" as const;
  return "info" as const;
};

const statusVariant = (s: string) => {
  if (s === "resolved") return "success" as const;
  if (s === "dismissed") return "neutral" as const;
  if (s === "investigating") return "primary" as const;
  if (s === "acknowledged") return "info" as const;
  return "warning" as const;
};

const PIPELINE: Array<{ key: string; label: string }> = [
  { key: "new", label: "New" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "investigating", label: "Investigating" },
  { key: "resolved", label: "Resolved" },
];

function pipelineIndex(status: string) {
  const idx = PIPELINE.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  const salaryKeys = ["salary", "paid", "amount", "net", "gross"];
  if (
    typeof value === "number" &&
    salaryKeys.some(k => key.toLowerCase().includes(k))
  ) {
    return `PKR ${value.toLocaleString()}`;
  }
  return String(value);
}

export function AlertDetailModal({ alert, open, onClose }: AlertDetailModalProps) {
  const [localNotes, setLocalNotes] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const updateAlertStatus = useUpdateAlertStatus();

  useEffect(() => {
    if (alert) {
      setLocalNotes(alert.resolutionNotes || "");
      setPendingStatus(null);
    }
  }, [alert]);

  if (!alert) return null;

  const isTerminal = alert.status === "resolved" || alert.status === "dismissed";
  const isSubmitting = updateAlertStatus.isPending;

  const handleAction = (newStatus: string) => {
    const requiresNotes = newStatus === "resolved";
    if (requiresNotes && !localNotes.trim()) {
      setPendingStatus(newStatus);
      return;
    }
    updateAlertStatus.mutate(
      { id: alert.id, data: { status: newStatus, resolutionNotes: localNotes || undefined } },
      { onSuccess: onClose }
    );
  };

  const detailEntries = alert.details
    ? Object.entries(alert.details).filter(
        ([k]) => !["employeeName", "employeeIds", "payslipIds", "contradictingDates"].includes(k)
      )
    : [];

  const currentIdx = pipelineIndex(alert.status);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground pr-6">
            {alert.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge variant={severityVariant(alert.severity)}>
              {alert.severity.toUpperCase()}
            </StatusBadge>
            <StatusBadge variant={statusVariant(alert.status)}>
              {alert.status}
            </StatusBadge>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
              fraud_detection
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              #{alert.id.slice(0, 8)}
            </span>
          </div>
        </DialogHeader>

        {/* Confidence bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Detection Confidence</span>
            <span className="font-medium text-foreground">{alert.confidenceScore}%</span>
          </div>
          <Progress value={alert.confidenceScore} className="h-1.5" />
        </div>

        {/* Employee info */}
        {alert.employeeName && (
          <div className="flex items-center gap-2 text-sm bg-elevated rounded-lg px-3 py-2">
            <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
            <span className="text-muted-foreground">Employee:</span>
            <span className="font-medium text-foreground">{alert.employeeName}</span>
            {alert.employeeCode && (
              <span className="text-muted-foreground text-xs">({alert.employeeCode})</span>
            )}
          </div>
        )}

        {/* Status pipeline */}
        {alert.status !== "dismissed" && (
          <div className="flex items-center gap-1 text-xs">
            {PIPELINE.map((step, idx) => (
              <div key={step.key} className="flex items-center gap-1">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded ${
                    idx <= currentIdx
                      ? "bg-primary-dim text-primary-text font-medium"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx < currentIdx && <CheckCircle className="h-3 w-3" />}
                  {idx === currentIdx && <Clock className="h-3 w-3" />}
                  {step.label}
                </div>
                {idx < PIPELINE.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        )}
        {alert.status === "dismissed" && (
          <div className="flex items-center gap-2 text-xs bg-muted px-3 py-2 rounded">
            <XCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">This alert was dismissed.</span>
          </div>
        )}

        {/* Detection details */}
        {detailEntries.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-elevated px-3 py-2 text-xs font-semibold text-foreground uppercase tracking-wide">
              Detection Details
            </div>
            <div className="divide-y divide-border">
              {detailEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{formatKey(key)}</span>
                  <span className="font-medium text-foreground text-right max-w-[60%] break-words">
                    {formatValue(key, value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case timeline */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-elevated px-3 py-2 text-xs font-semibold text-foreground uppercase tracking-wide">
            Case Timeline
          </div>
          <div className="px-3 py-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Detected</span>
              <span className="text-foreground">
                {new Date(alert.createdAt).toLocaleString("en-PK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            {alert.resolvedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {alert.status === "dismissed" ? "Dismissed" : "Resolved"}
                </span>
                <span className="text-foreground">
                  {new Date(alert.resolvedAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
            {alert.resolutionNotes && (
              <div className="mt-1 bg-muted rounded p-2 text-muted-foreground italic text-xs">
                "{alert.resolutionNotes}"
              </div>
            )}
          </div>
        </div>

        {/* Case management controls */}
        {!isTerminal && (
          <div className="space-y-3 pt-2 border-t border-border">
            <Textarea
              placeholder={
                alert.status === "investigating"
                  ? "Add investigation notes (required for resolution)..."
                  : "Add notes (optional)..."
              }
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            {pendingStatus === "resolved" && !localNotes.trim() && (
              <p className="text-xs text-danger-foreground">
                Resolution notes are required before marking as resolved.
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {alert.status === "new" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("acknowledged")}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                {alert.status === "acknowledged" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction("investigating")}
                    disabled={isSubmitting}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Start Investigation
                  </Button>
                )}
                {alert.status === "investigating" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction("dismissed")}
                      disabled={isSubmitting}
                      className="text-muted-foreground"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction("resolved")}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isSubmitting ? "Saving..." : "Mark Resolved"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {isTerminal && (
          <div className="pt-2 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
