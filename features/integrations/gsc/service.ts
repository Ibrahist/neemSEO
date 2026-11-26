import "server-only";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import * as gscRepo from "./repository";

export interface GscPerformanceRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscConnectionStatus {
  isConnected: boolean;
  siteUrl: string | null;
  lastSyncedAt: Date | null;
}

export class GscService {
  /**
   * Retrieves the current Google Search Console connection for a project.
   */
  async getConnectionStatus(projectId: string): Promise<GscConnectionStatus> {
    const integration = await gscRepo.getProjectIntegration(projectId, "gsc");

    if (!integration) {
      return { isConnected: false, siteUrl: null, lastSyncedAt: null };
    }

    let siteUrl = null;
    if (integration.settingsJson) {
      try {
        const settings = JSON.parse(integration.settingsJson);
        siteUrl = settings.siteUrl;
      } catch {
        // Ignore unparseable settings JSON
      }
    }

    return {
      isConnected: true,
      siteUrl,
      lastSyncedAt: integration.updatedAt,
    };
  }

  /**
   * Encrypts and persists GSC OAuth credentials at rest.
   */
  async saveConnection(
    projectId: string,
    data: {
      accessToken: string;
      refreshToken?: string;
      siteUrl: string;
    }
  ): Promise<void> {
    const encryptedTokens = encryptSecret(
      JSON.stringify({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
      })
    );

    const settingsJson = JSON.stringify({
      siteUrl: data.siteUrl,
    });

    await gscRepo.upsertProjectIntegration(projectId, {
      encryptedTokens,
      settingsJson,
    });
  }

  /**
   * Disconnects GSC integration for a project.
   */
  async disconnect(projectId: string): Promise<void> {
    await gscRepo.deleteProjectIntegration(projectId, "gsc");
  }

  /**
   * Fetches real Search Console query performance data when connected.
   * If not configured or not connected, returns configured: false with setup instructions.
   */
  async getPerformanceData(
    projectId: string,
    targetDomain: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    configured: boolean;
    rows: GscPerformanceRow[];
    totalClicks: number;
    totalImpressions: number;
  }> {
    const status = await this.getConnectionStatus(projectId);

    if (!status.isConnected) {
      return {
        configured: false,
        rows: [],
        totalClicks: 0,
        totalImpressions: 0,
      };
    }

    const integration = await gscRepo.getProjectIntegration(projectId, "gsc");
    if (!integration?.encryptedTokens) {
      return {
        configured: false,
        rows: [],
        totalClicks: 0,
        totalImpressions: 0,
      };
    }

    try {
      const decrypted = JSON.parse(decryptSecret(integration.encryptedTokens));
      const accessToken = decrypted.accessToken;

      if (!accessToken || accessToken.startsWith("mock_")) {
        return {
          configured: false,
          rows: [],
          totalClicks: 0,
          totalImpressions: 0,
        };
      }

      const siteUrl = status.siteUrl || `sc-domain:${targetDomain}`;
      const today = new Date();
      const defaultStart = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const defaultEnd = today.toISOString().split("T")[0];

      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDate || defaultStart,
            endDate: endDate || defaultEnd,
            dimensions: ["query", "page"],
            rowLimit: 50,
          }),
        }
      );

      if (!res.ok) {
        return {
          configured: true,
          rows: [],
          totalClicks: 0,
          totalImpressions: 0,
        };
      }

      const data = (await res.json()) as any;
      const rows: GscPerformanceRow[] = (data.rows || []).map((r: any) => ({
        query: r.keys?.[0] || "",
        page: r.keys?.[1] || "",
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: r.ctr || 0,
        position: r.position || 0,
      }));

      const totalClicks = rows.reduce((acc, row) => acc + row.clicks, 0);
      const totalImpressions = rows.reduce((acc, row) => acc + row.impressions, 0);

      return {
        configured: true,
        rows,
        totalClicks,
        totalImpressions,
      };
    } catch {
      return {
        configured: true,
        rows: [],
        totalClicks: 0,
        totalImpressions: 0,
      };
    }
  }
}
