import React, { useState, useEffect } from "react";
import { StatCard, Card, Badge, TH, TD } from "../components/ui";
import { Icon } from "../components/Icon";
import { C } from "../lib/theme";
import { fetchOrders, fetchReservations, fetchMaterials, fetchTransactions, fetchUsers } from "../lib/api";
import { fmtPeso } from "../lib/utils";

export function PageDashboard({ onNavigate }) {
  const [data, setData] = useState({
    orders: [],
    reservations: [],
    materials: [],
    transactions: [],
    users: []
  });

  useEffect(() => {
    async function load() {
      try {
        const [orders, reservations, materials, transactions, users] = await Promise.all([
          fetchOrders(), fetchReservations(), fetchMaterials(), fetchTransactions(), fetchUsers()
        ]);
        setData({ 
          orders: orders || [], 
          reservations: reservations || [], 
          materials: materials || [], 
          transactions: transactions || [],
          users: users || []
        });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const pendingOrders = data.orders.filter(o => o.order_status === "pending").length;
  const pendingReservations = data.reservations.filter(r => r.reservation_status === "pending").length;
  const lowStock = data.materials.filter(m => m.material_stock < m.material_reorder_level).length;
  
  // Very simplistic "today" check by getting today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRevenue = data.transactions
    .filter(t => t.transaction_date && t.transaction_date.startsWith(todayStr))
    .reduce((s, t) => s + Number(t.gross_amount), 0);
  const todayOrders = data.orders.filter(o => o.order_date && o.order_date.startsWith(todayStr)).length;

  const barHeights = [52, 76, 65, 86, 100, 90, 28];
  const barDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getUserName = (id) => {
    const u = data.users.find(u => u.user_id === id);
    return u ? `${u.user_fname} ${u.user_sname}` : "—";
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Revenue Today" value={`₱${todayRevenue.toLocaleString()}`} sub="Active today" subColor={C.green} accentColor={C.fg} icon={<Icon name="receipt" size={18} color="hsl(0,0%,70%)" />} />
        <StatCard label="Orders Today" value={todayOrders} sub="Active today" subColor={C.green} accentColor="hsl(221,83%,53%)" icon={<Icon name="clipboard" size={18} color="hsl(221,83%,60%)" />} />
        <StatCard label="Reservations Pending" value={pendingReservations} sub="Action required" accentColor={C.green} icon={<Icon name="calendar" size={18} color={C.green} />} />
        <StatCard label="Low Stock Alerts" value={lowStock} sub="Needs restocking" subColor={C.red} accentColor={C.red} icon={<Icon name="package" size={18} color={C.red} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card title="Weekly Revenue" action="Full Report">
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100, justifyContent: "space-evenly" }}>
              {barHeights.map((h, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 26, borderRadius: "3px 3px 0 0", background: i === 4 ? "hsl(0,0%,90%)" : "hsl(240,3.7%,25%)", height: h }} />
                  <span style={{ fontSize: 11.25, color: C.muted }}>{barDays[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Order Type Breakdown">
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {[["Dine-In", 58], ["Take-Out", 28], ["Online", 14]].map(([label, pct]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 16.25 }}>
                  <span style={{ color: "hsl(0,0%,88%)" }}>{label}</span>
                  <span style={{ color: C.muted }}>{pct}%</span>
                </div>
                <div style={{ background: "hsl(240,3.7%,13%)", borderRadius: 9999, height: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 9999, background: "hsl(0,0%,90%)", width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Recent Orders" action="View All" onAction={() => onNavigate("orders")}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Order</TH><TH>Customer</TH><TH>Type</TH><TH>Amount</TH><TH>Status</TH></tr></thead>
            <tbody>
              {data.orders.slice(0, 4).map((o, i) => (
                <tr key={o.order_id}>
                  <TD last={i === 3} style={{ color: C.muted }}>#{o.order_id}</TD>
                  <TD last={i === 3}>{o.user_id ? getUserName(o.user_id) : "—"}</TD>
                  <TD last={i === 3}><Badge variant={o.order_type}>{o.order_type.replace("-", " ")}</Badge></TD>
                  <TD last={i === 3} style={{ fontWeight: 500 }}>{fmtPeso(o.order_amount)}</TD>
                  <TD last={i === 3}><Badge variant={o.order_status}>{o.order_status}</Badge></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Low Stock Alerts" action="Manage" onAction={() => onNavigate("inventory")}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Material</TH><TH>Stock</TH><TH>Reorder</TH><TH>Status</TH></tr></thead>
            <tbody>
              {data.materials.filter(m => m.material_stock < m.material_reorder_level).slice(0, 4).map((m, i) => (
                <tr key={m.material_id}>
                  <TD last={i === 3}>{m.material_name}</TD>
                  <TD last={i === 3}>{m.material_stock}{m.material_unit}</TD>
                  <TD last={i === 3}>{m.material_reorder_level}{m.material_unit}</TD>
                  <TD last={i === 3}><Badge variant="low">Low</Badge></TD>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
