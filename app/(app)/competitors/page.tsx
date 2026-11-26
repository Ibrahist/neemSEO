import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function CompetitorsIndexPage() {
  await redirectToProjectWorkflow("competitors");
}
