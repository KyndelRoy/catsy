import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge } from "../components/ui";
import { fetchTransactions } from "../lib/api";
import { fmtDateTime, fmtPeso } from "../lib/utils";
import { C } from "../lib/theme";

export function PageTransactions() {
  const [methodFilter, setMethodFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions().then(data => setTransactions(data || [])).catch(console.error);
  }, []);

  const filtered = transactions
    .filter(t => methodFilter === "all" || t.payment_method === methodFilter)
    .sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Full payment and billing records" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="gcash">GCash</option>
          <option value="other">Other</option>
        </Select>
        <Input type="date" style={{ width: "auto" }} />
      </div>
      <Table headers={["Txn ID", "Order", "Gross", "Tax", "Net", "Method", "Points", "Claimed", "Date"]}>
        {filtered.map((t, i) => (
          <tr key={t.transaction_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{t.transaction_id}</TD>
            <TD last={i === filtered.length - 1}>#{t.order_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{fmtPeso(t.gross_amount)}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{fmtPeso(t.tax_amount)}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{fmtPeso(t.net_amount)}</TD>
            <TD last={i === filtered.length - 1} style={{ textTransform: "capitalize" }}>{t.payment_method}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.green, fontWeight: 500 }}>+{t.potential_points}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={t.points_is_claimed ? "active" : "inactive"}>{t.points_is_claimed ? "Yes" : "No"}</Badge></TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDateTime(t.transaction_date)}</TD>
          </tr>
        ))}
      </Table>
    </div>
  );
}
