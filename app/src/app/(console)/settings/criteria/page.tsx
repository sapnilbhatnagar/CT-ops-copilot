import { redirect } from "next/navigation";

// Qualifying criteria now live on each campaign (Campaigns -> campaign -> Criteria).
export default function CriteriaRedirect() {
  redirect("/campaigns");
}
