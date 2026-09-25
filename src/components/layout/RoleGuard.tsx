"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Role } from "@/lib/types";

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.role !== role) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.role]);

  if (state.role !== role) return null;
  return <>{children}</>;
}
