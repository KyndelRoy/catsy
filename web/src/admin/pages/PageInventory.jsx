import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { Icon } from "../components/Icon";
import { fetchMaterials } from "../lib/api";
import { C } from "../lib/theme";

export function PageInventory() {
  const [modal, setModal] = useState(false);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials().then(data => setMaterials(data || [])).catch(console.error);
  }, []);

  const lowCount = materials.filter(m => m.material_stock < m.material_reorder_level).length;

  return (
    <div>
      <PageHeader title="Raw Materials" subtitle="Track inventory levels and reorder thresholds" action="Add Material" onAction={() => setModal(true)} />
      {lowCount > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.yellowBorder}`, background: C.yellowBg, color: C.yellow, fontSize: 13, marginBottom: 16 }}>
          <Icon name="warning" size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{lowCount} material{lowCount > 1 ? "s are" : " is"} below their reorder level. Please restock soon.</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select style={{ width: "auto" }}><option>All Units</option><option>g</option><option>ml</option><option>unit</option></Select>
        <Select style={{ width: "auto" }}><option>All Status</option><option>Low Stock</option><option>OK</option></Select>
      </div>
      <Table headers={["ID", "Material", "Unit", "Current Stock", "Reorder Level", "Stock Level", "Status", "Actions"]}>
        {materials.map((m, i) => {
          const isLow = m.material_stock < m.material_reorder_level;
          const pct = Math.min(100, Math.round((m.material_stock / (m.material_reorder_level * 1.5)) * 100));
          return (
            <tr key={m.material_id}>
              <TD last={i === materials.length - 1} style={{ color: C.muted }}>#{m.material_id}</TD>
              <TD last={i === materials.length - 1} style={{ fontWeight: 500 }}>{m.material_name}</TD>
              <TD last={i === materials.length - 1} style={{ color: C.muted }}>{m.material_unit}</TD>
              <TD last={i === materials.length - 1} style={{ fontWeight: 500 }}>{m.material_stock}</TD>
              <TD last={i === materials.length - 1} style={{ color: C.muted }}>{m.material_reorder_level}</TD>
              <TD last={i === materials.length - 1}>
                <div style={{ background: "hsl(240,3.7%,13%)", borderRadius: 9999, height: 5, overflow: "hidden", width: 110 }}>
                  <div style={{ height: "100%", borderRadius: 9999, background: isLow ? C.red : "hsl(0,0%,70%)", width: `${pct}%` }} />
                </div>
              </TD>
              <TD last={i === materials.length - 1}><Badge variant={isLow ? "low" : "ok"}>{isLow ? "Low" : "OK"}</Badge></TD>
              <TD last={i === materials.length - 1}>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="success">Stock In</Btn>
                  <Btn>Edit</Btn>
                </div>
              </TD>
            </tr>
          );
        })}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Material"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Save</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <FormGroup label="Material Name"><Input placeholder="e.g. Vanilla Syrup" /></FormGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Unit"><Select><option value="g">g (grams)</option><option value="ml">ml (milliliters)</option><option value="unit">unit</option></Select></FormGroup>
            <FormGroup label="Initial Stock"><Input type="number" placeholder="0" /></FormGroup>
          </div>
          <FormGroup label="Reorder Level"><Input type="number" placeholder="0" /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
