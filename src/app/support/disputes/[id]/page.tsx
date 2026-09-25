"use client";

import { useParams } from "next/navigation";
import { DisputeDetail } from "@/components/shared/DisputeDetail";

export default function SupportDisputeDetailPage() {
  const params = useParams<{ id: string }>();
  return <DisputeDetail disputeId={params.id} />;
}
