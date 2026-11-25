"use client";

import { useTransition, useState } from "react";
import { checkAiVisibilityAction } from "@/features/ai-visibility/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Bot, Loader2, Sparkles } from "lucide-react";

interface CheckVisibilityFormProps {
  projectId: string;
  defaultBrand: string;
  defaultDomain: string;
}

const SAMPLE_PROMPTS = [
  "What is the best self-hosted SEO tool for agencies?",
  "What are the top open-source alternatives to Ahrefs and Semrush?",
  "How to track keyword rankings and backlinks with pay-as-you-go pricing?",
];

export function CheckVisibilityForm({
  projectId,
  defaultBrand,
  defaultDomain,
}: CheckVisibilityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [brandName, setBrandName] = useState(defaultBrand);
  const [targetDomain, setTargetDomain] = useState(defaultDomain);
  const [selectedEngines, setSelectedEngines] = useState<string[]>([
    "chatgpt",
    "claude",
    "perplexity",
    "gemini",
  ]);

  function toggleEngine(engine: string) {
    if (selectedEngines.includes(engine)) {
      if (selectedEngines.length === 1) {
        toast.error("Please select at least one AI engine");
        return;
      }
      setSelectedEngines(selectedEngines.filter((e) => e !== engine));
    } else {
      setSelectedEngines([...selectedEngines, engine]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a search prompt");
      return;
    }
    if (!brandName.trim()) {
      toast.error("Please enter your brand name");
      return;
    }
    if (!targetDomain.trim()) {
      toast.error("Please enter your target domain");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("prompt", prompt.trim());
      formData.set("brandName", brandName.trim());
      formData.set("targetDomain", targetDomain.trim());
      for (const engine of selectedEngines) {
        formData.append("engines", engine);
      }

      const res = await checkAiVisibilityAction(formData);
      if (res.success) {
        toast.success("AI engine citation check completed!");
        setPrompt("");
      } else {
        toast.error(res.error || "Failed to check AI visibility");
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Check AI Engine Citations & Brand Presence</CardTitle>
        </div>
        <CardDescription>
          Simulate or query real AI models to inspect if your brand is recommended and domain is
          linked as a trusted source.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">User Search Prompt</label>
            <Input
              placeholder="e.g. What are the best alternatives to Semrush for startups?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isPending}
              required
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Ideas:
              </span>
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => setPrompt(sample)}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Brand Name</label>
              <Input
                placeholder="e.g. neemSEO"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Target Domain</label>
              <Input
                placeholder="e.g. neemseo.com"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Answer Engines to Test</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "chatgpt", label: "ChatGPT" },
                { id: "claude", label: "Claude" },
                { id: "perplexity", label: "Perplexity" },
                { id: "gemini", label: "Google Gemini" },
              ].map((engine) => {
                const isSelected = selectedEngines.includes(engine.id);
                return (
                  <button
                    type="button"
                    key={engine.id}
                    onClick={() => toggleEngine(engine.id)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {engine.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Querying Engines...
              </>
            ) : (
              "Check AI Visibility"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
