import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";

const STATUSES = ["ALL","SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED","DISBURSED"];

function statusStyle(s) {
  const m = {
    APPROVED: { background:"#d1fae5", color:"#065f46" },
    DISBURSED: { background:"#dbeafe", color:"#1e40af" },
    REJECTED: { background:"#fee2e2", color:"#991b1b" },
    UNDER_REVIEW: { background:"#fef3c7", color:"#92400e" },
    SUBMITTED: { background:"#f1f5f9", color:"#475569" },
  };
  return m[s] || { background:"#f1f5f9", color:"#475569" };
}

const TableSkeleton = () => (
  <>
    {[1,2,3,4,5].map(i => (
      <tr key={i}>
        {[1,2,3,4,5,6,7,8].map(j => (
          <td key={j} style={{ padding: "14px 16px" }}>
            <div className="skeleton" style={{ height: 14, borderRadius: 4, width: j === 1 ? 140 : j === 2 ? 120 : 80 }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchAll = async (status) => {
    setLoading(true);
    try {
      const params = status !== "ALL" ? `?status=${status}` : "";
      const { data } = await api.get(`/applications/admin/all${params}`);
      setApplications(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(filter); }, [filter]);

  const totalValue = applications.reduce((s, a) => s + a.requestedLoanAmount, 0);
  const pending = applications.filter(a => ["SUBMITTED","UNDER_REVIEW"].includes(a.status)).length;
  const approved = applications.filter(a => ["APPROVED","DISBURSED"].includes(a.status)).length;

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <nav style={{
        background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 15 L10 4 L17 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 11 L14 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, color: "#fff", fontSize: 17 }}>LAMF Admin</span>
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            background: "rgba(59,130,246,0.2)", color: "#60a5fa",
            padding: "3px 8px", borderRadius: 100, fontFamily: "monospace",
          }}>ADMIN</span>
        </div>
        <button onClick={logout} style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#94a3b8", cursor: "pointer",
        }}>Logout</button>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Review and approve loan applications</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total", value: applications.length, icon: "📋", color: "#6366f1" },
            { label: "Pending", value: pending, icon: "⏳", color: "#f59e0b" },
            { label: "Approved", value: approved, icon: "✅", color: "#10b981" },
            { label: "Total Value", value: `₹${(totalValue/100000).toFixed(1)}L`, icon: "💰", color: "#3b82f6" },
          ].map((s, i) => loading ? (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ) : (
            <div key={i} style={{
              background: "#fff", borderRadius: 12, padding: "20px 22px",
              border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
              background: filter === s ? "#3b82f6" : "#fff",
              color: filter === s ? "#fff" : "#64748b",
              border: filter === s ? "1px solid #3b82f6" : "1px solid #e2e8f0",
              boxShadow: filter === s ? "0 2px 8px rgba(59,130,246,0.25)" : "none",
            }}>{s}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["App ID","Applicant","Product","Requested","LTV","Status","Date","Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <TableSkeleton /> : applications.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No applications found.</td></tr>
                ) : applications.map(app => (
                  <tr key={app._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                    onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#3b82f6" }}>{app.applicationId}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{app.applicant?.profile?.firstName} {app.applicant?.profile?.lastName}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{app.applicant?.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ color: "#334155" }}>{app.product?.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{app.product?.type}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>₹{app.requestedLoanAmount.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "14px 16px", color: "#334155" }}>{app.calculatedLTV.toFixed(1)}%</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ borderRadius: 100, padding: "4px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", ...statusStyle(app.status) }}>{app.status}</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(app.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link to={`/admin/applications/${app._id}`} style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: "1px solid #e2e8f0", color: "#475569", textDecoration: "none",
                        background: "#fff", display: "inline-block",
                        transition: "all 0.15s",
                      }}
                      onMouseOver={e => { e.target.style.background="#3b82f6"; e.target.style.color="#fff"; e.target.style.borderColor="#3b82f6"; }}
                      onMouseOut={e => { e.target.style.background="#fff"; e.target.style.color="#475569"; e.target.style.borderColor="#e2e8f0"; }}
                      >Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
