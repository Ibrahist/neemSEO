import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function AgentIndexPage() {
  await redirectToProjectWorkflow("agent");
}
