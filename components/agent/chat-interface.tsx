"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Loader2, Sparkles, Terminal } from "lucide-react";
import { useRef, useEffect } from "react";

interface ChatInterfaceProps {
  projectId: string;
  projectName: string;
  projectDomain: string;
}

const SUGGESTED_PROMPTS = [
  "Run a technical site audit to find broken links and missing tags",
  "Research high-volume keywords related to SEO software",
  "Find keyword gaps where competitors outrank us",
  "Check whether our brand is cited by AI answer engines",
];

export function ChatInterface({ projectId, projectName, projectDomain }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/agent/chat",
    body: { projectId },
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="flex h-[750px] flex-col border-border">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                neemSEO Autonomous Agent
                <Badge
                  variant="outline"
                  className="text-[10px] text-emerald-500 border-emerald-500/30"
                >
                  Online
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Context: {projectName} ({projectDomain}) • Direct access to all MCP tools
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            Claude 3.5 / OpenRouter
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Messages Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                How can I help with {projectDomain}?
              </h3>
              <p className="mt-1 max-w-sm text-xs">
                I can research keywords, track position history, compare competitor gaps, inspect
                backlinks, run audits, and test AI engine citations.
              </p>

              <div className="mt-6 flex flex-col gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => append({ role: "user", content: prompt })}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-left text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border text-foreground"
                    }`}
                  >
                    {isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border text-foreground"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-invert prose-xs max-w-none space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Thinking and querying tools...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder={`Ask anything about ${projectDomain} SEO...`}
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="text-xs"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
