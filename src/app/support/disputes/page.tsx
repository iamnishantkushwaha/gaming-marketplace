"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Empty";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { shortDate } from "@/lib/format";

export default function SupportDisputesPage() {
  const { state } = useApp();
  const router = useRouter();

  if (state.disputes.length === 0) return <EmptyState title="No open disputes — nice and quiet." />;

  return (
    <div className="space-y-5">
      <h1 className="gt-page-title">Disputes</h1>
      <Table>
        <THead>
          <Th>Order</Th>
          <Th>Buyer</Th>
          <Th>Seller</Th>
          <Th>Reason</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {state.disputes.map((d) => {
            const order = state.orders.find((o) => o.id === d.orderId);
            const buyer = state.users.find((u) => u.id === order?.buyerId);
            const seller = state.users.find((u) => u.id === order?.sellerId);
            return (
              <Tr key={d.id} onClick={() => router.push(`/support/disputes/${d.id}`)}>
                <Td className="text-brand-400">{d.orderId}</Td>
                <Td className="text-base-300">{buyer?.name}</Td>
                <Td className="text-base-300">{seller?.name}</Td>
                <Td className="text-base-300">{d.reason}</Td>
                <Td>
                  <StatusBadge status={d.status} kind="dispute" />
                </Td>
              </Tr>
            );
          })}
        </TBody>
        {state.disputes.map((d) => {
          const order = state.orders.find((o) => o.id === d.orderId);
          const buyer = state.users.find((u) => u.id === order?.buyerId);
          return (
            <MobileRow key={d.id} onClick={() => router.push(`/support/disputes/${d.id}`)}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-base-100 text-sm">{d.orderId}</p>
                <StatusBadge status={d.status} kind="dispute" />
              </div>
              <MobileRowLine label="Buyer" value={buyer?.name ?? ""} />
              <MobileRowLine label="Opened" value={shortDate(d.openedDate)} />
            </MobileRow>
          );
        })}
      </Table>
    </div>
  );
}
