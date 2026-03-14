import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { fetchUsers } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { C } from "../lib/theme";

export function PageUsers() {
  const [modal, setModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then(data => setUsers(data || [])).catch(console.error);
  }, []);

  const filtered = users.filter(u => roleFilter === "all" || u.user_role === roleFilter);

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage staff, admins, and customer accounts" action="Add User" onAction={() => setModal(true)} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </Select>
        <Select style={{ width: "auto" }}><option>All Status</option><option>Active</option><option>Inactive</option></Select>
        <Input placeholder="Search user…" style={{ width: 200 }} />
      </div>
      <Table headers={["ID", "Name", "Email", "Username", "Contact", "Role", "Status", "Joined", "Actions"]}>
        {filtered.map((u, i) => (
          <tr key={u.user_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{u.user_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{u.user_fname} {u.user_sname}</TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{u.user_email}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{u.user_username}</TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{u.user_contact || "—"}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={u.user_role}>{u.user_role}</Badge></TD>
            <TD last={i === filtered.length - 1}><Badge variant={u.user_isactive ? "active" : "inactive"}>{u.user_isactive ? "Active" : "Inactive"}</Badge></TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDate(u.user_created)}</TD>
            <TD last={i === filtered.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>{u.user_role === "customer" ? "View" : "Edit"}</Btn>
                {u.user_id !== 1 && (u.user_isactive ? <Btn variant="danger">Deactivate</Btn> : <Btn variant="success">Activate</Btn>)}
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="Add User"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Create User</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="First Name"><Input placeholder="First name" /></FormGroup>
            <FormGroup label="Last Name"><Input placeholder="Last name" /></FormGroup>
          </div>
          <FormGroup label="Email"><Input type="email" placeholder="email@example.com" /></FormGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Username"><Input placeholder="username" /></FormGroup>
            <FormGroup label="Contact"><Input placeholder="09XXXXXXXXX" /></FormGroup>
          </div>
          <FormGroup label="Role">
            <Select><option value="customer">Customer</option><option value="staff">Staff</option><option value="admin">Admin</option></Select>
          </FormGroup>
        </div>
      </Modal>
    </div>
  );
}
