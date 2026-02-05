import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Chatbot } from "@/components/Chatbot";

interface AppShellProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

export function AppShell({ children, showSearch = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Mobile spacing for fixed header */}
        <div className="h-14 lg:hidden" />
        
        <TopBar showSearch={showSearch} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
}
