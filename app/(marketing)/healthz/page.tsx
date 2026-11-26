import { redirect } from "next/navigation";

export default function HealthzPage() {
  redirect("/health");
}
