import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { fetchOrders, fetchUsers, fetchReservations } from "../lib/api";
import { fmtDateTime, fmtPeso } from "../lib/utils";
import { C } from "../lib/theme";

export function PageOrders() {
  const [modal, setModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [o, u, r] = await Promise.all([fetchOrders(), fetchUsers(), fetchReservations()]);
        setOrders(o || []);
        setUsers(u || []);
        setReservations(r || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const getUserName = (id) => {
    const u = users.find(u => u.user_id === id);
    return u ? `${u.user_fname} ${u.user_sname}` : "—";
  };

  const filtered = orders.filter(o =>
    (statusFilter === "all" || o.order_status === statusFilter) &&
    (typeFilter === "all" || o.order_type === typeFilter)
  ).sort((a,b) => new Date(b.order_date) - new Date(a.order_date));

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage and track all customer orders" action="New Order" onAction={() => setModal(true)} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Types</option>
          <option value="dine-in">Dine-In</option>
          <option value="take-out">Take-Out</option>
          <option value="online">Online</option>
        </Select>
        <Input type="date" style={{ width: "auto" }} />
        <Input placeholder="Search order…" style={{ width: 200 }} />
      </div>
      <Table headers={["Order ID", "Customer", "Reservation", "Type", "Date", "Amount", "Status", "Actions"]}>
        {filtered.map((o, i) => (
          <tr key={o.order_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{o.order_id}</TD>
            <TD last={i === filtered.length - 1}>{o.user_id ? getUserName(o.user_id) : <span style={{ color: C.muted }}>—</span>}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{o.reservation_id ? `#RES-${o.reservation_id}` : "—"}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={o.order_type}>{o.order_type.replace("-", " ")}</Badge></TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDateTime(o.order_date)}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{fmtPeso(o.order_amount)}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={o.order_status}>{o.order_status}</Badge></TD>
            <TD last={i === filtered.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>View</Btn>
                {o.order_status === "pending" && <Btn variant="success">Complete</Btn>}
                {o.order_status === "pending" && <Btn variant="danger">Fail</Btn>}
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="New Order"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Create Order</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Customer">
              <Select>
                <option>— Guest —</option>
                {users.filter(u => u.user_role === "customer").map(u => <option key={u.user_id}>{u.user_fname} {u.user_sname}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Order Type"><Select><option value="dine-in">Dine-In</option><option value="take-out">Take-Out</option><option value="online">Online</option></Select></FormGroup>
          </div>
          <FormGroup label="Reservation (optional)">
            <Select>
              <option>— None —</option>
              {reservations.filter(r => r.reservation_status === "accepted").map(r => <option key={r.reservation_id}>#{r.reservation_id} — {r.guest_fname} {r.guest_sname}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Note"><Input placeholder="Internal note…" /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
