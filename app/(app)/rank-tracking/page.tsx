import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function RankTrackingIndexPage() {
  await redirectToProjectWorkflow("rank-tracking");
}
