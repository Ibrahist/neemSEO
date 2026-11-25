import { ImageResponse } from "next/og";

export const alt = "neemSEO — Open-Source Self-Hostable SEO Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "80px",
        fontFamily: "system-ui, sans-serif",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#042f2e",
          }}
        >
          N
        </div>
        <span style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-1px" }}>
          neem<span style={{ color: "#10b981" }}>SEO</span>
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: "56px",
            fontWeight: "800",
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            maxWidth: "960px",
          }}
        >
          The Open-Source, Pay-As-You-Go SEO Platform
        </div>
        <div
          style={{
            fontSize: "26px",
            color: "#a3a3a3",
            maxWidth: "840px",
            lineHeight: 1.4,
          }}
        >
          Bring your own DataForSEO API key. Keyword research, rank tracking, competitor
          intelligence, backlinks, audits, and MCP AI agents.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "30px",
            fontSize: "18px",
            color: "#34d399",
            fontWeight: "600",
          }}
        >
          Zero Subscription Markup
        </div>
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "30px",
            fontSize: "18px",
            color: "#e5e5e5",
          }}
        >
          Built for Humans & AI Agents
        </div>
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "30px",
            fontSize: "18px",
            color: "#e5e5e5",
          }}
        >
          Cloudflare Workers + Docker
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
