import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn, Modal, FormGroup } from "../components/ui";
import { fetchProducts, fetchCategories } from "../lib/api";
import { fmtPeso } from "../lib/utils";
import { C } from "../lib/theme";

export function PageProducts() {
  const [modal, setModal] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        setProducts(p || []);
        setCategories(c || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const getCategoryName = (id) => categories.find((c) => c.category_id === id)?.category_name || "—";

  const filtered = products.filter(p => catFilter === "all" || p.category_id === Number(catFilter));

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your coffee menu and offerings" action="Add Product" onAction={() => setModal(true)} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Categories</option>
          {categories.filter(c => c.category_isactive).map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </Select>
        <Select style={{ width: "auto" }}><option>All Status</option><option>Available</option><option>Unavailable</option></Select>
      </div>
      <Table headers={["ID", "Product", "Category", "Price", "Points", "Featured", "Available", "Actions"]}>
        {filtered.map((p, i) => (
          <tr key={p.product_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{p.product_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{p.product_name}</TD>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>{getCategoryName(p.category_id)}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{fmtPeso(p.product_price)}</TD>
            <TD last={i === filtered.length - 1} style={{ color: p.product_has_points ? C.green : C.muted }}>{p.product_has_points ? "Yes" : "—"}</TD>
            <TD last={i === filtered.length - 1} style={{ color: p.product_is_featured ? C.green : C.muted }}>{p.product_is_featured ? "Yes" : "—"}</TD>
            <TD last={i === filtered.length - 1}><Badge variant={p.product_is_available ? "active" : "inactive"}>{p.product_is_available ? "Yes" : "No"}</Badge></TD>
            <TD last={i === filtered.length - 1}>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn>Edit</Btn>
                <Btn>Recipe</Btn>
                {p.product_is_available ? <Btn variant="danger">Deactivate</Btn> : <Btn variant="success">Activate</Btn>}
              </div>
            </TD>
          </tr>
        ))}
      </Table>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Product"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Save Product</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Product Name"><Input placeholder="e.g. Caramel Macchiato" /></FormGroup>
            <FormGroup label="Category">
              <Select>
                {categories.filter(c => c.category_isactive).map(c => <option key={c.category_id}>{c.category_name}</option>)}
              </Select>
            </FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Price (₱)"><Input type="number" placeholder="0.00" /></FormGroup>
            <FormGroup label="Image URL"><Input placeholder="https://…" /></FormGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Has Points Rewards?"><Select><option>Yes</option><option>No</option></Select></FormGroup>
            <FormGroup label="Featured?"><Select><option>No</option><option>Yes</option></Select></FormGroup>
          </div>
          <FormGroup label="Availability">
            <Select><option>Available</option><option>Unavailable</option></Select>
            <span style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Controls whether this item appears on the customer menu.</span>
          </FormGroup>
        </div>
      </Modal>
    </div>
  );
}
