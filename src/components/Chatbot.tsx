import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleChatbot } from "@/store/slices/uiSlice";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    content: "Hi! I'm your PayrollX Assistant. I can help you with:\n\n• Salary information\n• Attendance records\n• Leave balance\n• Payroll queries\n\nHow can I assist you today?",
  },
];

export function Chatbot() {
  const dispatch = useAppDispatch();
  const { chatbotOpen } = useAppSelector((state) => state.ui);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: getBotResponse(input),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("salary")) {
      return "Your net salary for November 2024 is PKR 67,500. This includes:\n\n• Basic: PKR 80,000\n• Allowances: PKR 43,000\n• Deductions: PKR 6,150\n• Tax: PKR 9,840\n\nWould you like more details?";
    }
    if (lowerQuery.includes("leave") || lowerQuery.includes("balance")) {
      return "Your current leave balance:\n\n• Annual Leave: 10 days\n• Sick Leave: 6 days\n• Casual Leave: 4 days\n\nWould you like to apply for leave?";
    }
    if (lowerQuery.includes("attendance")) {
      return "Your attendance this month:\n\n• Present: 18 days\n• Late: 2 days\n• On Leave: 1 day\n• Attendance Rate: 94%\n\nYour performance is excellent!";
    }
    
    return "I understand you're asking about \"" + query + "\". Let me look into that for you. In the meantime, you can also check the relevant section in the sidebar for more details.";
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => dispatch(toggleChatbot())}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-primary-hover",
          chatbotOpen && "hidden"
        )}
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] h-[550px] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
          chatbotOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-elevated">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">PayrollX Assistant</h3>
              <p className="text-xs text-success-foreground">● Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleChatbot())}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-elevated text-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-background"
            />
            <Button onClick={handleSend} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
