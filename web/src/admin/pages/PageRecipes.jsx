import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Card, Btn, Modal, FormGroup } from "../components/ui";
import { fetchProducts, fetchRecipes, fetchMaterials } from "../lib/api";
import { C } from "../lib/theme";

export function PageRecipes() {
  const [modal, setModal] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [p, r, m] = await Promise.all([fetchProducts(), fetchRecipes(), fetchMaterials()]);
        setProducts(p || []);
        setRecipes(r || []);
        setMaterials(m || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const productRecipes = products.map(p => ({
    ...p,
    ingredients: recipes.filter(r => r.product_id === p.product_id).map(r => ({
      ...r,
      material: materials.find(m => m.material_id === r.material_id),
    })),
  })).filter(p => p.ingredients.length > 0);

  return (
    <div>
      <PageHeader title="Product Recipes" subtitle="Define raw material requirements per product" action="Add Recipe" onAction={() => setModal(true)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {productRecipes.map(p => (
          <Card key={p.product_id} title={p.product_name} action="Edit Recipe">
            {p.ingredients.map((ing, i) => (
              <div key={ing.recipe_id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 20px", borderBottom: i < p.ingredients.length - 1 ? `1px solid hsl(240,3.7%,12%)` : "none",
                fontSize: 13,
              }}>
                <span style={{ fontWeight: 500, color: "hsl(0,0%,88%)" }}>{ing.material?.material_name || "Unknown"}</span>
                <span style={{ color: C.muted }}>{ing.quantity_required} {ing.material?.material_unit || ""}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Recipe Entry"
        footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary">Save</Btn></>}>
        <div style={{ display: "grid", gap: 16 }}>
          <FormGroup label="Product"><Select>{products.map(p => <option key={p.product_id}>{p.product_name}</option>)}</Select></FormGroup>
          <FormGroup label="Raw Material"><Select>{materials.map(m => <option key={m.material_id}>{m.material_name}</option>)}</Select></FormGroup>
          <FormGroup label="Quantity Required"><Input type="number" placeholder="0" /></FormGroup>
        </div>
      </Modal>
    </div>
  );
}
