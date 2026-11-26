import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function KeywordsIndexPage() {
  await redirectToProjectWorkflow("keywords");
}
