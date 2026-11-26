import "server-only";
import * as backlinkRepo from "./repository";
import { executeDataForSEOQuery } from "@/lib/dataforseo/client";
import { getEnv } from "@/lib/env";

export interface AnchorRecord {
  anchor: string;
  backlinksCount: number;
  referringDomainsCount: number;
  percentage: number;
}

export interface NewLostLinkRecord {
  date: string;
  newLinks: number;
  lostLinks: number;
}

export interface BacklinksOverviewResult {
  snapshot: backlinkRepo.BacklinkSnapshotRecord | null;
  referringDomains: backlinkRepo.ReferringDomainRecord[];
  anchors: AnchorRecord[];
  newLostTrend: NewLostLinkRecord[];
}

/**
 * Retrieves only the stored snapshot from the database without triggering any outbound network requests.
 */
export async function getStoredBacklinkSnapshot(
  projectId: string,
  domain: string
): Promise<backlinkRepo.BacklinkSnapshotRecord | null> {
  const cleanDomain = domain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  return await backlinkRepo.getLatestBacklinkSnapshot(projectId, cleanDomain);
}

export async function getBacklinksOverview(params: {
  projectId: string;
  userId?: string | null;
  domain: string;
  customApiKey?: string;
}): Promise<BacklinksOverviewResult> {
  const { projectId, userId, domain, customApiKey } = params;
  const cleanDomain = domain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  const today = new Date().toISOString().split("T")[0];

  const existing = await backlinkRepo.getLatestBacklinkSnapshot(projectId, cleanDomain);
  let snapshot = existing;
  let referringDomains = existing
    ? await backlinkRepo.getReferringDomains(projectId, cleanDomain)
    : [];
  let anchors: AnchorRecord[] = [];
  let newLostTrend: NewLostLinkRecord[] = [];

  const env = getEnv();
  const apiKey = customApiKey || env.DATAFORSEO_API_KEY;

  if (apiKey) {
    // 1. Fetch real Backlinks Summary
    try {
      const summaryEndpoint = "backlinks/summary/live";
      const summaryPayload = [{ target: cleanDomain }];
      const summaryRes = await executeDataForSEOQuery<any>(summaryEndpoint, summaryPayload, {
        projectId,
        userId,
        customApiKey,
      });
      const item = summaryRes.tasks?.[0]?.result?.[0];

      if (item) {
        const totalBacklinks = item.backlinks ?? 0;
        const referringCount = item.referring_domains ?? 0;
        const domainRank = item.rank ?? 0;

        snapshot = await backlinkRepo.insertBacklinkSnapshot({
          projectId,
          domain: cleanDomain,
          totalBacklinks,
          referringDomainsCount: referringCount,
          rank: domainRank,
          snapshotDate: today,
        });
      }
    } catch (err) {
      console.warn("DataForSEO backlinks/summary/live failed:", err);
    }

    // 2. Fetch real Referring Domains
    try {
      const refEndpoint = "backlinks/referring_domains/live";
      const refPayload = [{ target: cleanDomain, limit: 20 }];
      const refRes = await executeDataForSEOQuery<any>(refEndpoint, refPayload, {
        projectId,
        userId,
        customApiKey,
      });
      const refItems = refRes.tasks?.[0]?.result?.[0]?.items || [];

      if (refItems.length > 0) {
        const recordsToInsert = refItems.map((r: any) => ({
          projectId,
          targetDomain: cleanDomain,
          referringDomain: r.domain || r.referring_domain,
          backlinksCount: r.backlinks || 1,
          rank: r.rank || 0,
          firstSeen: r.first_seen ? String(r.first_seen).split(" ")[0] : null,
          lastSeen: r.last_seen ? String(r.last_seen).split(" ")[0] : null,
        }));

        await backlinkRepo.insertReferringDomains(recordsToInsert);
        referringDomains = await backlinkRepo.getReferringDomains(projectId, cleanDomain);
      }
    } catch (err) {
      console.warn("DataForSEO backlinks/referring_domains/live failed:", err);
    }

    // 3. Fetch real Anchors
    try {
      const anchorsEndpoint = "backlinks/anchors/live";
      const anchorsPayload = [{ target: cleanDomain, limit: 15 }];
      const anchorsRes = await executeDataForSEOQuery<any>(anchorsEndpoint, anchorsPayload, {
        projectId,
        userId,
        customApiKey,
      });
      const anchorItems = anchorsRes.tasks?.[0]?.result?.[0]?.items || [];

      if (anchorItems.length > 0) {
        const totalBacklinksCount = snapshot?.totalBacklinks || 1;
        anchors = anchorItems.map((a: any) => ({
          anchor: a.anchor || "—",
          backlinksCount: a.backlinks || 0,
          referringDomainsCount: a.referring_domains || 0,
          percentage: Math.min(
            100,
            Math.round(((a.backlinks || 0) / Math.max(1, totalBacklinksCount)) * 100)
          ),
        }));
      }
    } catch (err) {
      console.warn("DataForSEO backlinks/anchors/live failed:", err);
    }

    // 4. Fetch real Link Velocity (timeseries_new_lost_summary)
    try {
      const timeseriesEndpoint = "backlinks/timeseries_new_lost_summary/live";
      const dFrom = new Date();
      dFrom.setDate(dFrom.getDate() - 14);
      const dateFromStr = dFrom.toISOString().split("T")[0];

      const timeseriesPayload = [{ target: cleanDomain, date_from: dateFromStr, date_to: today }];
      const tsRes = await executeDataForSEOQuery<any>(timeseriesEndpoint, timeseriesPayload, {
        projectId,
        userId,
        customApiKey,
      });
      const tsItems = tsRes.tasks?.[0]?.result?.[0]?.items || [];

      if (tsItems.length > 0) {
        newLostTrend = tsItems.map((item: any) => ({
          date: String(item.date || "").slice(5), // MM-DD
          newLinks: item.new_backlinks ?? 0,
          lostLinks: item.lost_backlinks ?? 0,
        }));
      }
    } catch (err) {
      console.warn("DataForSEO backlinks/timeseries_new_lost_summary/live failed:", err);
    }
  }

  return {
    snapshot,
    referringDomains,
    anchors,
    newLostTrend,
  };
}
