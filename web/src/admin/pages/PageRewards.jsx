import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { fetchRewards, fetchUsers, fetchPointsClaimLog } from "../lib/api";
import { fmtDate, fmtDateTime } from "../lib/utils";
import { C } from "../lib/theme";

export function PageRewards() {
  const [modal, setModal] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [r, u, c] = await Promise.all([fetchRewards(), fetchUsers(), fetchPointsClaimLog()]);
        setRewards(r || []);
        setUsers(u || []);
        setClaims(c || []);
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

  return (
    <div>
      <PageHeader title="Rewards Ledger" subtitle="Customer points and available rewards" action="Adjust Points" onAction={() => setModal(true)} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select style={{ width: "auto" }}><option>All Customers</option>{users.filter(u => u.user_role === "customer").map(u => <option key={u.user_id}>{u.user_fname} {u.user_sname}</option>)}</Select>
      </div>
      <Table headers={["ID", "Customer", "Points Balance", "Total Redeemed", "Status", "Actions"]}>
        {rewards.map((r, i) => (
          <tr key={r.reward_id}>
            <TD last={i === rewards.length - 1} style={{ color: C.muted }}>#{r.reward_id}</TD>
            <TD last={i === rewards.length - 1} style={{ fontWeight: 500 }}>{getUserName(r.user_id)}</TD>
            <TD last={i === rewards.length - 1} style={{ fontWeight: 500, color: C.green }}>{r.point_count} pts</TD>
            <TD last={i === rewards.length - 1} style={{ color: C.muted }}>{r.total_redeemed}</TD>
            <TD last={i === rewards.length - 1}><Badge variant="active">Active</Badge></TD>
            <TD last={i === rewards.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>History</Btn>
                <Btn>Adjust</Btn>
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 17.5, fontWeight: 500, color: C.fg, marginBottom: 12 }}>Points Claim Log</h3>
        <Table headers={["Claim ID", "Customer", "Transaction", "Points Earned", "Claim Date"]}>
          {claims.map((c, i) => (
            <tr key={c.claim_id}>
              <TD last={i === claims.length - 1} style={{ color: C.muted }}>#{c.claim_id}</TD>
              <TD last={i === claims.length - 1} style={{ fontWeight: 500 }}>{getUserName(c.user_id)}</TD>
              <TD last={i === claims.length - 1} style={{ color: C.muted }}>#{c.transaction_id}</TD>
              <TD last={i === claims.length - 1} style={{ color: C.green, fontWeight: 600 }}>+{c.points_earned}</TD>
              <TD last={i === claims.length - 1} style={{ fontSize: 15, color: C.muted }}>{fmtDateTime(c.claim_date)}</TD>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Adjust Points"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Confirm</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <FormGroup label="Customer"><Select>{users.filter(u => u.user_role === "customer").map(u => <option key={u.user_id}>{u.user_fname} {u.user_sname}</option>)}</Select></FormGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Action"><Select><option>Add Points</option><option>Deduct Points</option></Select></FormGroup>
            <FormGroup label="Amount"><Input type="number" placeholder="0" /></FormGroup>
          </div>
          <FormGroup label="Reason / Note"><Input placeholder="e.g. Apology for delayed order" /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
