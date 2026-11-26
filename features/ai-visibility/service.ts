import "server-only";
import {
  AiVisibilityRepository,
  AiVisibilityPromptRecord,
  AiVisibilityResultRecord,
} from "./repository";

export interface CheckAiVisibilityInput {
  projectId: string;
  prompt: string;
  brandName: string;
  targetDomain: string;
  engines?: string[];
}

export interface PromptWithResults {
  prompt: AiVisibilityPromptRecord;
  results: AiVisibilityResultRecord[];
}

export interface AiVisibilitySummary {
  totalPrompts: number;
  totalChecks: number;
  brandMentionRate: number;
  domainCitationRate: number;
  engineBreakdown: Record<string, { checks: number; mentions: number; citations: number }>;
  recentPrompts: PromptWithResults[];
}

const DEFAULT_ENGINES = ["chatgpt", "claude", "perplexity", "gemini"];

export class AiVisibilityService {
  constructor(private repo = new AiVisibilityRepository()) {}

  async checkPromptVisibility(input: CheckAiVisibilityInput): Promise<PromptWithResults> {
    const engines = input.engines && input.engines.length > 0 ? input.engines : DEFAULT_ENGINES;
    const promptId = `aip_${crypto.randomUUID()}`;
    const now = new Date();

    const promptRecord: AiVisibilityPromptRecord = {
      id: promptId,
      projectId: input.projectId,
      prompt: input.prompt.trim(),
      brandName: input.brandName.trim(),
      targetDomain: input.targetDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, ""),
      createdAt: now,
    };

    await this.repo.savePrompt(promptRecord);

    const results: AiVisibilityResultRecord[] = [];

    for (const engine of engines) {
      const responseText = await this.queryEngine(
        engine,
        promptRecord.prompt,
        promptRecord.brandName,
        promptRecord.targetDomain
      );

      const isBrandMentioned = this.evaluateBrandMention(responseText, promptRecord.brandName);

      const { isDomainCited, citationUrls } = this.evaluateDomainCitation(
        responseText,
        promptRecord.targetDomain
      );

      results.push({
        id: `air_${crypto.randomUUID()}`,
        promptId,
        projectId: input.projectId,
        engine,
        responseText,
        isBrandMentioned,
        isDomainCited,
        citationUrlsJson: citationUrls.length > 0 ? JSON.stringify(citationUrls) : null,
        checkedAt: new Date(),
      });
    }

    await this.repo.saveResults(results);

    return {
      prompt: promptRecord,
      results,
    };
  }

  async getVisibilitySummary(projectId: string): Promise<AiVisibilitySummary> {
    const [prompts, results] = await Promise.all([
      this.repo.listPrompts(projectId),
      this.repo.listResultsForProject(projectId),
    ]);

    const totalPrompts = prompts.length;
    const totalChecks = results.length;

    let totalMentions = 0;
    let totalCitations = 0;
    const engineBreakdown: Record<string, { checks: number; mentions: number; citations: number }> =
      {};

    for (const r of results) {
      if (r.isBrandMentioned) totalMentions++;
      if (r.isDomainCited) totalCitations++;

      if (!engineBreakdown[r.engine]) {
        engineBreakdown[r.engine] = { checks: 0, mentions: 0, citations: 0 };
      }
      engineBreakdown[r.engine].checks++;
      if (r.isBrandMentioned) engineBreakdown[r.engine].mentions++;
      if (r.isDomainCited) engineBreakdown[r.engine].citations++;
    }

    const brandMentionRate = totalChecks > 0 ? Math.round((totalMentions / totalChecks) * 100) : 0;
    const domainCitationRate =
      totalChecks > 0 ? Math.round((totalCitations / totalChecks) * 100) : 0;

    const resultMap = new Map<string, AiVisibilityResultRecord[]>();
    for (const r of results) {
      const list = resultMap.get(r.promptId) || [];
      list.push(r);
      resultMap.set(r.promptId, list);
    }

    const recentPrompts: PromptWithResults[] = prompts.map((p) => ({
      prompt: p,
      results: resultMap.get(p.id) || [],
    }));

    return {
      totalPrompts,
      totalChecks,
      brandMentionRate,
      domainCitationRate,
      engineBreakdown,
      recentPrompts,
    };
  }

  private evaluateBrandMention(text: string, brandName: string): boolean {
    const lowerText = text.toLowerCase();
    const lowerBrand = brandName.toLowerCase();
    return lowerText.includes(lowerBrand);
  }

  private evaluateDomainCitation(
    text: string,
    targetDomain: string
  ): { isDomainCited: boolean; citationUrls: string[] } {
    const urlRegex = /https?:\/\/[^\s\)\"\>]+/g;
    const matches = text.match(urlRegex) || [];
    const lowerDomain = targetDomain.toLowerCase();

    const citationUrls: string[] = [];
    let isDomainCited = text.toLowerCase().includes(lowerDomain);

    for (const match of matches) {
      citationUrls.push(match);
      if (match.toLowerCase().includes(lowerDomain)) {
        isDomainCited = true;
      }
    }

    return {
      isDomainCited,
      citationUrls: Array.from(new Set(citationUrls)),
    };
  }

  /**
   * Queries AI Answer Engine through OpenRouter.
   * Never fabricates fake mentions or citations.
   */
  private async queryEngine(
    engine: string,
    prompt: string,
    _brandName: string,
    _targetDomain: string
  ): Promise<string> {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      if (process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "test") {
        return `[Demo Mode] Evaluation response for prompt: "${prompt}". No real OpenRouter API call made.`;
      }
      throw new Error(
        "OPENROUTER_API_KEY is not configured. An API key is required to test AI model visibility."
      );
    }

    const modelMap: Record<string, string> = {
      chatgpt: "openai/gpt-4o-mini",
      claude: "anthropic/claude-3.5-haiku",
      perplexity: "perplexity/sonar",
      gemini: "google/gemini-2.0-flash-001",
    };

    const model = modelMap[engine] || "openai/gpt-4o-mini";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://neemseo.com",
        "X-Title": "neemSEO",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as any;
    const text = json.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response received from OpenRouter model.");
    }
    return text;
  }
}
