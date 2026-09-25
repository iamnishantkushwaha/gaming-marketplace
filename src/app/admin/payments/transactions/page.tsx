"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { TransactionType } from "@/lib/types";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, Tr, Th, Td, MobileRow, MobileRowLine } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { money, shortDate } from "@/lib/format";

export default function AdminTransactionsPage() {
  const { state, toast } = useApp();
  const [type, setType] = useState<"All" | TransactionType>("All");

  const filtered = type === "All" ? state.transactions : state.transactions.filter((t) => t.type === type);
  const totalProcessed = filtered.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalCommission = filtered.reduce((s, t) => s + (t.commission ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="gt-page-title">Transactions</h1>
        <button onClick={() => toast("Export would download a CSV in the full product")} className="gt-btn-secondary">
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="gt-card p-4">
          <p className="text-xs text-base-400">Total processed</p>
          <p className="mt-1 gt-stat-value">{money(totalProcessed)}</p>
        </div>
        <div className="gt-card p-4">
          <p className="text-xs text-base-400">Total commission</p>
          <p className="mt-1 gt-stat-value">{money(totalCommission)}</p>
        </div>
      </div>

      <Select
        className="w-44"
        value={type}
        onChange={(v) => setType(v as "All" | TransactionType)}
        options={[
          { value: "All", label: "All types" },
          { value: "Purchase", label: "Sale" },
          { value: "Payout", label: "Payout" },
          { value: "Refund", label: "Refund" },
        ]}
      />

      <Table>
        <THead>
          <Th>Date</Th>
          <Th>Type</Th>
          <Th>User</Th>
          <Th>Amount</Th>
          <Th>Commission</Th>
          <Th>Status</Th>
        </THead>
        <TBody>
          {filtered.map((t) => {
            const user = state.users.find((u) => u.id === t.userId);
            return (
              <Tr key={t.id}>
                <Td className="text-base-400">{shortDate(t.date)}</Td>
                <Td>
                  <Badge tone="neutral">{t.type}</Badge>
                </Td>
                <Td className="text-base-300">{user?.name}</Td>
                <Td className="text-base-100 font-medium">{money(t.amount)}</Td>
                <Td className="text-base-400">{t.commission ? money(t.commission) : "—"}</Td>
                <Td>
                  <StatusBadge status={t.status} kind="transaction" />
                </Td>
              </Tr>
            );
          })}
        </TBody>
        {filtered.map((t) => {
          const user = state.users.find((u) => u.id === t.userId);
          return (
            <MobileRow key={t.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-base-100 text-sm">{user?.name}</p>
                <StatusBadge status={t.status} kind="transaction" />
              </div>
              <MobileRowLine label="Type" value={t.type} />
              <MobileRowLine label="Amount" value={money(t.amount)} />
              <MobileRowLine label="Date" value={shortDate(t.date)} />
            </MobileRow>
          );
        })}
      </Table>
    </div>
  );
}
