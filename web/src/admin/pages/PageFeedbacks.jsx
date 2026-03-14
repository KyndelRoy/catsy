import React, { useState, useEffect } from "react";
import { PageHeader, Select, Input, Table, TD, Badge, Btn } from "../components/ui";
import { fetchFeedbacks, fetchUsers } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { C } from "../lib/theme";

export function PageFeedbacks() {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [f, u] = await Promise.all([fetchFeedbacks(), fetchUsers()]);
        setFeedbacks(f || []);
        setUsers(u || []);
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

  const filtered = feedbacks.filter(f => ratingFilter === "all" || f.rating === Number(ratingFilter)).sort((a,b) => new Date(b.feedback_date) - new Date(a.feedback_date));

  return (
    <div>
      <PageHeader title="Customer Feedback" subtitle="Reviews and ratings from customers" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </Select>
        <Input type="date" style={{ width: "auto" }} />
      </div>
      <Table headers={["ID", "Customer", "Rating", "Comments", "Date", "Actions"]}>
        {filtered.map((f, i) => (
          <tr key={f.feedback_id}>
            <TD last={i === filtered.length - 1} style={{ color: C.muted }}>#{f.feedback_id}</TD>
            <TD last={i === filtered.length - 1} style={{ fontWeight: 500 }}>{getUserName(f.user_id)}</TD>
            <TD last={i === filtered.length - 1}>
              <div style={{ display: "flex", gap: 2, color: C.yellow }}>
                {Array(5).fill(0).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={j < f.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                ))}
              </div>
            </TD>
            <TD last={i === filtered.length - 1} style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.muted }}>{f.comments}</TD>
            <TD last={i === filtered.length - 1} style={{ fontSize: 12, color: C.muted }}>{fmtDate(f.feedback_date)}</TD>
            <TD last={i === filtered.length - 1}>
              <Btn>Read</Btn>
            </TD>
          </tr>
        ))}
      </Table>
    </div>
  );
}
