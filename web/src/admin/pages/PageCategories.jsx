import React, { useState, useEffect } from "react";
import { PageHeader, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { fetchCategories } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { C } from "../lib/theme";

export function PageCategories() {
  const [modal, setModal] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(data => setCategories(data || [])).catch(console.error);
  }, []);

  return (
    <div>
      <PageHeader title="Categories" subtitle="Organize your product catalog" action="Add Category" onAction={() => setModal(true)} />
      <Table headers={["ID", "Name", "Description", "Status", "Created", "Actions"]}>
        {categories.map((c, i) => (
          <tr key={c.category_id}>
            <TD last={i === categories.length - 1} style={{ color: C.muted }}>#{c.category_id}</TD>
            <TD last={i === categories.length - 1} style={{ fontWeight: 500 }}>{c.category_name}</TD>
            <TD last={i === categories.length - 1} style={{ color: C.muted }}>{c.category_description}</TD>
            <TD last={i === categories.length - 1}><Badge variant={c.category_isactive ? "active" : "inactive"}>{c.category_isactive ? "Active" : "Inactive"}</Badge></TD>
            <TD last={i === categories.length - 1} style={{ fontSize: 12, color: C.muted }}>{fmtDate(c.category_created)}</TD>
            <TD last={i === categories.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>Edit</Btn>
                {c.category_isactive ? <Btn variant="danger">Deactivate</Btn> : <Btn variant="success">Activate</Btn>}
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Category"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Save Category</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <FormGroup label="Category Name"><Input placeholder="e.g. Cold Drinks" /></FormGroup>
          <FormGroup label="Description"><Input placeholder="Short description…" /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
