import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge } from "../components/ui";
import { fetchInventoryLogs, fetchMaterials, fetchUsers } from "../lib/api";
import { fmtDateTime } from "../lib/utils";
import { C } from "../lib/theme";

export function PageInventoryLogs() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [l, m, u] = await Promise.all([fetchInventoryLogs(), fetchMaterials(), fetchUsers()]);
        setLogs(l || []);
        setMaterials(m || []);
        setUsers(u || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const filtered = logs.filter(l => typeFilter === "all" || l.log_type === typeFilter).sort((a,b) => new Date(b.log_created) - new Date(a.log_created));

  const getMaterialName = (id) => materials.find(m => m.material_id === id)?.material_name || "—";
  const getUserName = (id) => {
    const u = users.find(u => u.user_id === id);
    return u ? `${u.user_fname} ${u.user_sname}` : "—";
  };

  return (
    <div>
      <PageHeader title="Inventory Logs" subtitle="Append-only record of all stock movements" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Types</option>
          <option value="stock_in">Stock In</option>
          <option value="stock_out">Stock Out</option>
        </Select>
        <Select style={{ width: "auto" }}>
          <option>All Materials</option>
          {materials.map(m => <option key={m.material_id}>{m.material_name}</option>)}
        </Select>
        <Input type="date" style={{ width: "auto" }} />
      </div>
      <Table headers={["Log ID", "Material", "Type", "Qty Change", "Balance After", "Staff", "Timestamp"]}>
        {filtered.map((l, i) => (
          <tr key={l.log_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{l.log_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{getMaterialName(l.material_id)}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={l.log_type}>{l.log_type === "stock_in" ? "Stock In" : "Stock Out"}</Badge></TD>
            <TD last={i === filtered.length - 1} style={{ color: l.log_type === "stock_in" ? C.green : C.red, fontWeight: 500 }}>
              {l.log_type === "stock_in" ? "+" : ""}{l.quantity_change} {materials.find(m => m.material_id === l.material_id)?.material_unit}
            </TD>
            <TD last={i === filtered.length - 1}>{l.balance_after} {materials.find(m => m.material_id === l.material_id)?.material_unit}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{getUserName(l.performed_by)}</TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDateTime(l.log_created)}</TD>
          </tr>
        ))}
      </Table>
    </div>
  );
}
