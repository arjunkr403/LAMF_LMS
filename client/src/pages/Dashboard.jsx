import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";
import { getStatusColor } from "../lib/utils";

// Skeleton components
const StatSkeleton = () => (
  <div className="skeleton" style={{ height: 88, borderRadius: 12 }} />
);
const RowSkeleton = () => (
  <div className="skeleton" style={{ height: 74, borderRadius: 12, marginBottom: 10 }} />
);

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "20px 22px",
    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications")
      .then(({ data }) => setApplications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: applications.length,
    approved: applications.filter(a => ["APPROVED","DISBURSED"].includes(a.status)).length,
    pending: applications.filter(a => ["SUBMITTED","UNDER_REVIEW"].includes(a.status)).length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 17 }}>LAMF Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Hello, <strong style={{ color: "#0f172a" }}>{user?.profile?.firstName}</strong></span>
          <Link to="/new-application" style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff",
            textDecoration: "none", boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
          }}>+ New Application</Link>
          <button onClick={logout} style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: "transparent", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer",
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>My Applications</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Track all your LAMF loan applications</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
          {loading ? [1,2,3,4].map(i => <StatSkeleton key={i} />) : (
            <>
              <StatCard label="Total Applications" value={stats.total} icon="📋" color="#6366f1" />
              <StatCard label="Approved / Disbursed" value={stats.approved} icon="✅" color="#10b981" />
              <StatCard label="Pending Review" value={stats.pending} icon="⏳" color="#f59e0b" />
              <StatCard label="Rejected" value={stats.rejected} icon="❌" color="#ef4444" />
            </>
          )}
        </div>

        {/* Applications list */}
        {loading ? (
          <div>{[1,2,3].map(i => <RowSkeleton key={i} />)}</div>
        ) : applications.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px dashed #cbd5e1",
            padding: "64px 32px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No applications yet</h3>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Pledge your mutual funds and get a loan in 24 hours</p>
            <Link to="/new-application" style={{
              padding: "11px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", textDecoration: "none",
            }}>Create First Application</Link>
          </div>
        ) : (
          <div>
            {applications.map(app => (
              <div key={app._id} style={{
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                padding: "18px 22px", marginBottom: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.15s",
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
              onMouseOut={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>📄</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, fontFamily: "monospace" }}>{app.applicationId}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {app.product?.name} · {new Date(app.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Requested</div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>₹{app.requestedLoanAmount.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Collateral</div>
                    <div style={{ fontWeight: 600, color: "#334155" }}>₹{app.totalCollateralValue.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>LTV</div>
                    <div style={{ fontWeight: 600, color: "#334155" }}>{app.calculatedLTV.toFixed(1)}%</div>
                  </div>
                  <span style={{
                    borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 700,
                    ...statusStyle(app.status),
                  }}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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

export default Dashboard;
