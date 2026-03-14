import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn } from "../components/ui";
import { fetchReservations } from "../lib/api";
import { fmtDateTime } from "../lib/utils";
import { C } from "../lib/theme";

export function PageReservations() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations().then(data => setReservations(data || [])).catch(console.error);
  }, []);

  const filtered = reservations
    .filter(r => statusFilter === "all" || r.reservation_status === statusFilter)
    .sort((a,b) => new Date(b.reservation_date) - new Date(a.reservation_date));

  return (
    <div>
      <PageHeader title="Reservations" subtitle="Review and manage table reservation requests" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </Select>
        <Input type="date" style={{ width: "auto" }} />
      </div>
      <Table headers={["ID", "Guest", "Contact", "Party", "Date & Time", "Notes", "Status", "Actions"]}>
        {filtered.map((r, i) => (
          <tr key={r.reservation_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{r.reservation_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{r.guest_fname} {r.guest_sname}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{r.guest_contact || "—"}</TD>
            <TD last={i === filtered.length - 1}>{r.guest_quantity} pax</TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15 }}>{fmtDateTime(r.reservation_date)}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted, fontSize: 15 }}>{r.reservation_notes || "—"}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={r.reservation_status}>{r.reservation_status}</Badge></TD>
            <TD last={i === filtered.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                {r.reservation_status === "pending" ? <><Btn variant="success">Accept</Btn><Btn variant="danger">Decline</Btn></> : <Btn>View</Btn>}
              </div>
            </TD>
          </tr>
        ))}
      </Table>
    </div>
  );
}
