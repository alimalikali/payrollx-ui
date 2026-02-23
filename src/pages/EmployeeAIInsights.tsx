import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { useEmployeeAIInsights } from "@/hooks";

export default function EmployeeAIInsights() {
  const navigate = useNavigate();
  const insightsQuery = useEmployeeAIInsights();
  const data = insightsQuery.data?.data;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My AI Insights</h1>
          <p className="text-muted-foreground mt-1">Personal AI guidance based on your attendance, leaves, and payslips.</p>
        </div>

        {insightsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading insights...</p>}
        {insightsQuery.isError && <p className="text-sm text-danger">Unable to load AI insights.</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Insights" subtitle="Current recommendations">
            <div className="space-y-3">
              {(data?.aiInsights.insights || []).map((insight, index) => (
                <div key={`${insight.type}-${index}`} className="rounded-md border border-border p-3">
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
              {(data?.aiInsights.insights || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No active AI insights right now.</p>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Quick Actions" subtitle="Use suggested actions">
            <div className="flex flex-wrap gap-2">
              {(data?.aiInsights.actions || []).map((action, index) => (
                <Button key={`${action.type}-${index}`} size="sm" variant="outline" onClick={() => navigate(action.path)}>
                  {action.label}
                </Button>
              ))}
              {(data?.aiInsights.actions || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No actions required.</p>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}
