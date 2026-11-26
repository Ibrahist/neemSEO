import { redirectToProjectWorkflow } from "@/features/projects/redirect";

export default async function SettingsIndexPage() {
  await redirectToProjectWorkflow("settings");
}
