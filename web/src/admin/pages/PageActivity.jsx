import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge } from "../components/ui";
import { fetchActivityLogs, fetchUsers } from "../lib/api";
import { fmtDateTime } from "../lib/utils";
import { C } from "../lib/theme";

export function PageActivity() {
  const [actionFilter, setActionFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [l, u] = await Promise.all([fetchActivityLogs(), fetchUsers()]);
        setLogs(l || []);
        setUsers(u || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const ACTION_TYPES = ["LOGIN", "LOGOUT", "INVENTORY", "PROCESS_SALE", "UPDATE_PRODUCT", "MANAGE_USER", "UPDATE_TAX", "UPDATE_PRICING", "GENERATE_REPORT"];
  const filtered = logs.filter(l => actionFilter === "all" || l.action_type === actionFilter).sort((a,b) => new Date(b.log_created) - new Date(a.log_created));

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Admin-only audit trail of all staff actions" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Actions</option>
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select style={{ width: "auto" }}>
          <option>All Users</option>
          {users.filter(u => u.user_role !== "customer").map(u => <option key={u.user_id}>{u.user_fname} {u.user_sname}</option>)}
        </Select>
        <Input type="date" style={{ width: "auto" }} />
      </div>
      <Table headers={["Log ID", "User", "Role", "Action", "Details", "Timestamp"]}>
        {filtered.map((l, i) => {
          const user = users.find(u => u.user_id === l.user_id);
          return (
            <tr key={l.log_id}>
              <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{l.log_id}</TD>
              <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{user ? `${user.user_fname} ${user.user_sname}` : "—"}</TD>
              <TD last={i === filtered.length - 1}>{user && <Badge variant={user.user_role}>{user.user_role}</Badge>}</TD>
              <TD last={i === filtered.length - 1}>
                <code style={{ background: "hsl(240,3.7%,12%)", color: "hsl(0,0%,80%)", padding: "2px 7px", borderRadius: 4, fontSize: 13.75, fontFamily: "ui-monospace, monospace", border: `1px solid hsl(240,3.7%,20%)` }}>
                  {l.action_type}
                </code>
              </TD>
              <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{l.action_details}</TD>
              <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDateTime(l.log_created)}</TD>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
