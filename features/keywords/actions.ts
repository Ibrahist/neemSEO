"use server";

import { z } from "zod";
import { requireProjectAccess } from "@/lib/auth/session";
import * as keywordService from "./service";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

const searchKeywordsSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  seedKeyword: z.string().min(1, "Seed keyword cannot be empty"),
  locationCode: z.coerce.number().default(2840),
  languageCode: z.string().default("en"),
});

export async function searchKeywordsAction(rawInput: unknown) {
  const input = searchKeywordsSchema.parse(rawInput);
  const { user } = await requireProjectAccess(input.projectId);

  const result = await keywordService.searchKeywords({
    projectId: input.projectId,
    userId: user.id,
    seedKeyword: input.seedKeyword,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
  });

  revalidatePath(`/projects/${input.projectId}/keywords`);
  return { success: true, data: result };
}

export async function exportKeywordsCsvAction(
  searchId: string,
  projectId: string
): Promise<string> {
  await requireProjectAccess(projectId);
  const keywords = await keywordService.getKeywordsForSearch(searchId, projectId);

  const rows = keywords.map((kw) => ({
    Keyword: kw.keyword,
    "Search Volume": kw.searchVolume,
    "Keyword Difficulty (KD)": kw.keywordDifficulty,
    "Cost Per Click (USD)": kw.cpc.toFixed(2),
    Competition: kw.competition.toFixed(2),
    Intent: kw.intent,
    "Last Updated": new Date(kw.updatedAt).toISOString(),
  }));

  return Papa.unparse(rows, { escapeFormulae: true });
}
