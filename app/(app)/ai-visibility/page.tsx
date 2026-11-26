import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function AiVisibilityIndexPage() {
  await redirectToProjectWorkflow("ai-visibility");
}
