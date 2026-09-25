"use client";

import { useParams } from "next/navigation";
import { DisputeDetail } from "@/components/shared/DisputeDetail";

export default function AdminDisputeDetailPage() {
  const params = useParams<{ id: string }>();
  return <DisputeDetail disputeId={params.id} />;
}
