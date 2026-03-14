import React, { useState, useEffect } from "react";
import { PageHeader, Input, Table, TD, Badge, Btn, Modal, FormGroup, Select } from "../components/ui";
import { Icon } from "../components/Icon";
import { fetchTaxSettings } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { C } from "../lib/theme";

export function PageTax() {
  const [modal, setModal] = useState(false);
  const [taxes, setTaxes] = useState([]);

  useEffect(() => {
    fetchTaxSettings().then(data => setTaxes(data || [])).catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Tax Rates" subtitle="Configure system-wide tax percentages" action="Add Tax Rate" onAction={() => setModal(true)} />
      <Table headers={["ID", "Name", "Rate (%)", "Status", "Actions"]}>
        {taxes.map((t, i) => (
          <tr key={t.tax_id}>
            <TD last={i === taxes.length - 1} style={{ color: C.muted }}>#{t.tax_id}</TD>
            <TD last={i === taxes.length - 1} style={{ fontWeight: 500 }}>{t.tax_name}</TD>
            <TD last={i === taxes.length - 1} style={{ fontWeight: 500, color: C.fg }}>{t.tax_rate * 100}%</TD>
            <TD last={i === taxes.length - 1}><Badge variant={t.tax_isactive ? "active" : "inactive"}>{t.tax_isactive ? "Active" : "Inactive"}</Badge></TD>
            <TD last={i === taxes.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>Edit</Btn>
                {t.tax_isactive ? <Btn variant="danger">Deactivate</Btn> : <Btn variant="success">Activate</Btn>}
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Tax Rate"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Save Configuration</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Tax Name"><Input placeholder="e.g. VAT" /></FormGroup>
            <FormGroup label="Rate (%)"><Input type="number" placeholder="12.00" /></FormGroup>
          </div>
          <FormGroup label="Status"><Select><option>Active</option><option>Inactive</option></Select></FormGroup>
        </div>
      </Modal>

      <div style={{ marginTop: 32, padding: 20, borderRadius: 8, background: "hsl(240,3.7%,13%)", border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 17.5, fontWeight: 500, color: C.fg, marginBottom: 8 }}>Tax Application Logic</h3>
        <p style={{ fontSize: 16.25, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
          Active tax rates are automatically applied to the subtotal of all standard orders (Dine-In, Take-Out, Online) to calculate the final `gross_amount` during the checkout and transaction recording phase. If multiple taxes are active, their percentages are summed up combined.
        </p>
        <p style={{ fontSize: 15, color: "hsl(0,0%,50%)" }}>Note: Changing these rates will only affect new orders and transactions. Past records remain immutable with their historical applied tax rate.</p>
      </div>
    </div>
  );
}
