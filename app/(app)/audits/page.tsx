import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function AuditsIndexPage() {
  await redirectToProjectWorkflow("audits");
}
