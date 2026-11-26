import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function BacklinksIndexPage() {
  await redirectToProjectWorkflow("backlinks");
}
