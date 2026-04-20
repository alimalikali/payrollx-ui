import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleChatbot } from "@/store/slices/uiSlice";
import { useSendChatMessage } from "@/hooks";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  suggestions?: string[];
}

/** Renders bot message text with basic markdown: **bold**, bullet lines, newlines */
function ChatText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <span className="whitespace-pre-wrap">
      {lines.map((line, i) => {
        // Render bold segments: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        );
        return (
          <span key={i}>
            {rendered}
            {i < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </span>
  );
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  type: "bot",
  content:
    "Hi! I'm your PayrollX Assistant. I can help you with:\n\n• Salary information\n• Attendance records\n• Leave balance\n• Tax queries\n• Payroll questions\n\nHow can I assist you today?",
  suggestions: ["What is my salary?", "Check leave balance", "Attendance this month", "Tax information"],
};

export function Chatbot() {
  const dispatch = useAppDispatch();
  const { chatbotOpen } = useAppSelector((state) => state.ui);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendChatMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add a temporary "typing" indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, type: "bot", content: "..." },
    ]);

    sendMessage.mutate(
      { sessionId, message: messageText },
      {
        onSuccess: (response) => {
          const data = response.data;
          // Persist session ID for conversation continuity
          if (data.sessionId && !sessionId) {
            setSessionId(data.sessionId);
          }

          setMessages((prev) =>
            prev
              .filter((m) => m.id !== typingId)
              .concat({
                id: `bot-${Date.now()}`,
                type: "bot",
                content: typeof data.message === "string" ? data.message : String(data.message || "I couldn't process that request."),
                suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
              })
          );
        },
        onError: () => {
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== typingId)
              .concat({
                id: `bot-error-${Date.now()}`,
                type: "bot",
                content: "Sorry, I'm having trouble connecting. Please try again.",
              })
          );
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => dispatch(toggleChatbot())}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-primary-hover",
          chatbotOpen && "hidden"
        )}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200",
          chatbotOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-elevated">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
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
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-elevated text-foreground rounded-bl-sm",
                  message.content === "..." && "animate-pulse"
                )}
              >
                {message.content === "..." ? (
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <ChatText content={message.content} />
                )}
              </div>
            </div>
          ))}

          {/* Suggestion chips for the last bot message */}
          {(() => {
            const lastBot = [...messages].reverse().find((m) => m.type === "bot" && m.content !== "...");
            if (!lastBot?.suggestions?.length) return null;
            return (
              <div className="flex flex-wrap gap-2">
                {lastBot.suggestions.slice(0, 4).map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-elevated text-foreground hover:bg-primary/10 hover:border-primary transition-colors"
                    disabled={sendMessage.isPending}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            );
          })()}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about salary, leaves, attendance..."
              className="flex-1 bg-background text-sm"
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={() => handleSend()}
              size="icon"
              className="shrink-0"
              disabled={!input.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
