import React, { useState, useEffect } from "react";
import { Icon } from "./components/Icon";
import { Btn } from "./components/ui";
import { C } from "./lib/theme";
import { fetchUsers, fetchOrders, fetchReservations, fetchMaterials } from "./lib/api";

// Import all pages
import { PageDashboard } from "./pages/PageDashboard";
import { PageOrders } from "./pages/PageOrders";
import { PageReservations } from "./pages/PageReservations";
import { PageTransactions } from "./pages/PageTransactions";
import { PageProducts } from "./pages/PageProducts";
import { PageCategories } from "./pages/PageCategories";
import { PageInventory } from "./pages/PageInventory";
import { PageRecipes } from "./pages/PageRecipes";
import { PageInventoryLogs } from "./pages/PageInventoryLogs";
import { PageUsers } from "./pages/PageUsers";
import { PageRewards } from "./pages/PageRewards";
import { PageFeedbacks } from "./pages/PageFeedbacks";
import { PageTax } from "./pages/PageTax";
import { PageActivity } from "./pages/PageActivity";

const PAGE_TITLES = {
  dashboard: "Dashboard", orders: "Orders", reservations: "Reservations",
  transactions: "Transactions", products: "Products", categories: "Categories",
  inventory: "Raw Materials", recipes: "Product Recipes", inv_logs: "Inventory Logs",
  users: "Users", rewards: "Rewards & Points", feedbacks: "Feedbacks",
  tax: "Tax Settings", activity: "Activity Logs",
};

const PAGE_COMPONENTS = {
  dashboard: PageDashboard,
  orders: PageOrders,
  reservations: PageReservations,
  transactions: PageTransactions,
  products: PageProducts,
  categories: PageCategories,
  inventory: PageInventory,
  recipes: PageRecipes,
  inv_logs: PageInventoryLogs,
  users: PageUsers,
  rewards: PageRewards,
  feedbacks: PageFeedbacks,
  tax: PageTax,
  activity: PageActivity,
};

export default function CatsyCoffeeAdmin() {
  const [activePage, setActivePage] = useState("dashboard");
  const [counts, setCounts] = useState({ orders: 0, reservations: 0, inventory: 0 });
  const [user, setUser] = useState({ user_fname: "Catsy", user_sname: "Admin", user_role: "admin" });

  useEffect(() => {
    async function loadGlobalStats() {
      try {
        const [orders, res, inv, users] = await Promise.all([
          fetchOrders(), fetchReservations(), fetchMaterials(), fetchUsers()
        ]);
        setCounts({
          orders: orders?.filter(o => o.order_status === "pending").length || 0,
          reservations: res?.filter(r => r.reservation_status === "pending").length || 0,
          inventory: inv?.filter(m => m.material_stock < m.material_reorder_level).length || 0
        });
        if (users && users.length > 0) {
          const u = users.find(u => u.user_role === "admin") || users[0];
          setUser(u);
        }
      } catch (err) {
        console.error("Failed to load global stats:", err);
      }
    }
    loadGlobalStats();
  }, [activePage]); // refresh counts when changing pages

  const NAV_SECTIONS = [
    {
      label: "Overview",
      items: [{ id: "dashboard", label: "Dashboard", icon: "dashboard" }],
    },
    {
      label: "Operations",
      items: [
        { id: "orders", label: "Orders", icon: "receipt", badge: counts.orders },
        { id: "reservations", label: "Reservations", icon: "calendar", badge: counts.reservations },
        { id: "transactions", label: "Transactions", icon: "creditcard" },
      ],
    },
    {
      label: "Catalog",
      items: [
        { id: "products", label: "Products", icon: "coffee" },
        { id: "categories", label: "Categories", icon: "tag" },
      ],
    },
    {
      label: "Inventory",
      items: [
        { id: "inventory", label: "Raw Materials", icon: "box", badgeDanger: counts.inventory },
        { id: "recipes", label: "Product Recipes", icon: "clipboard" },
        { id: "inv_logs", label: "Inventory Logs", icon: "folder" },
      ],
    },
    {
      label: "Customers",
      items: [
        { id: "users", label: "Users", icon: "users" },
        { id: "rewards", label: "Rewards", icon: "star" },
        { id: "feedbacks", label: "Feedbacks", icon: "message" },
      ],
    },
    {
      label: "System",
      items: [
        { id: "tax", label: "Tax Settings", icon: "scale" },
        { id: "activity", label: "Activity Logs", icon: "activity" },
      ],
    },
  ];

  const initials = `${user.user_fname?.[0] || ""}${user.user_sname?.[0] || ""}`.toUpperCase();
  const ActivePage = PAGE_COMPONENTS[activePage];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, color: C.fg, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14 }}>
      {/* ── SIDEBAR ── */}
      <nav style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", background: C.sidebar, borderRight: `1px solid ${C.border}` }}>
        {/* Brand */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: C.fg, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}><Icon name="coffee" size={15} color="hsl(240,5.9%,10%)" /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.fg, letterSpacing: "-0.01em" }}>Catsy Coffee</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(240,5%,40%)", marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <div style={{ paddingTop: 12, flex: 1 }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label} style={{ paddingTop: 4 }}>
              <div style={{ padding: "12px 16px 6px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "hsl(240,5%,35%)" }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const isActive = activePage === item.id;
                return (
                  <div key={item.id}
                    onClick={() => setActivePage(item.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 16px", fontSize: 13, fontWeight: isActive ? 500 : 400,
                      color: isActive ? C.fg : C.muted,
                      cursor: "pointer",
                      borderLeft: `2px solid ${isActive ? C.fg : "transparent"}`,
                      background: isActive ? "hsl(240,3.7%,15.9%)" : "transparent",
                      transition: "all 0.15s", userSelect: "none", whiteSpace: "nowrap",
                      borderRadius: "0 6px 6px 0", margin: "1px 8px 1px 0",
                    }}>
                    <Icon name={item.icon} size={15} />
                    {item.label}
                    {item.badge > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 9999, background: C.fg, color: "hsl(240,5.9%,10%)" }}>
                        {item.badge}
                      </span>
                    )}
                    {item.badgeDanger > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 9999, background: "hsl(0,72%,35%)", color: "#fff" }}>
                        {item.badgeDanger}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, background: "hsl(240,3.7%,18%)", color: "hsl(0,0%,90%)", border: `1px solid hsl(240,3.7%,25%)` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(0,0%,90%)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.user_fname} {user.user_sname}
            </div>
            <div style={{ fontSize: 10, color: "hsl(240,5%,45%)", textTransform: "capitalize" }}>{user.user_role}</div>
          </div>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(240,5%,40%)", padding: 2, fontSize: 14 }}><Icon name="logout" size={14} /></button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 56, background: C.topbar, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.fg, letterSpacing: "-0.01em" }}>{PAGE_TITLES[activePage]}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Admin / {PAGE_TITLES[activePage]}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.muted, pointerEvents: "none" }}><Icon name="search" size={13} /></span>
            <input style={{ background: "hsl(240,3.7%,10%)", border: `1px solid ${C.borderMd}`, borderRadius: 8, padding: "6px 12px 6px 32px", fontSize: 13, color: "hsl(0,0%,90%)", width: 200, outline: "none", fontFamily: "inherit" }} placeholder="Search…" />
          </div>
          <button style={{ position: "relative", border: `1px solid ${C.borderMd}`, borderRadius: 8, padding: 7, background: "transparent", cursor: "pointer", color: C.muted, fontSize: 14 }}>
            <Icon name="bell" size={15} />
            <span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, background: C.red, borderRadius: 9999, border: `1.5px solid ${C.topbar}` }} />
          </button>
          <Btn variant="primary" onClick={() => { }}><Icon name="plus" size={14} /> New</Btn>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <ActivePage onNavigate={setActivePage} />
        </div>
      </div>
    </div>
  );
}
