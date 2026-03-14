export const fmtDate = (d) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
export const fmtDateTime = (d) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtPeso = (n) => `₱${Number(n).toFixed(2)}`;
