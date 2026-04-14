import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "sonner";

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

// Skeleton for detail page
const DetailSkeleton = () => (
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>
    <div className="skeleton" style={{ height: 36, width: 160, borderRadius: 8, marginBottom: 28 }} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[120, 180].map((h,i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[200, 140].map((h,i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />)}
      </div>
    </div>
  </div>
);

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState(null); // { type }
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(({ data }) => setApplication(data))
      .catch(() => toast.error("Failed to load application"))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      await api.put(`/applications/${id}/status`, { status: dialog.type, remarks });
      setApplication(prev => ({ ...prev, status: dialog.type, adminRemarks: remarks }));
      toast.success(`Marked as ${dialog.type}`);
      setDialog(null);
    } catch {
      toast.error("Failed to update. Try again.");
    } finally { setActionLoading(false); }
  };

  const isClosed = application && ["REJECTED","DISBURSED"].includes(application.status);

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <nav style={{
        background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 15 L10 4 L17 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 11 L14 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, color: "#fff", fontSize: 17 }}>LAMF Admin</span>
        </div>
        <button onClick={() => navigate("/admin")} style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", cursor: "pointer",
        }}>← Back to Dashboard</button>
      </nav>

      {pageLoading ? <DetailSkeleton /> : !application ? (
        <div style={{ textAlign: "center", padding: 80, color: "#64748b" }}>Application not found.</div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: "#3b82f6", marginBottom: 4 }}>{application.applicationId}</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Application Review</h1>
            </div>
            <span style={{ borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 700, ...statusStyle(application.status) }}>
              {application.status}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, alignItems: "start" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Applicant */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "monospace" }}>APPLICANT DETAILS</div>
                {[
                  { l: "Name", v: `${application.applicant?.profile?.firstName} ${application.applicant?.profile?.lastName}` },
                  { l: "Email", v: application.applicant?.email },
                  { l: "Phone", v: application.applicant?.profile?.phone },
                  { l: "PAN", v: application.applicant?.profile?.panCard },
                ].map(({ l, v }) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Loan Overview */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "monospace" }}>LOAN OVERVIEW</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Product</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{application.product?.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{application.product?.type} @ {application.product?.interestRate}% p.a.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  {[
                    { l: "Requested", v: `₹${application.requestedLoanAmount.toLocaleString("en-IN")}`, highlight: false },
                    { l: "Eligible", v: `₹${application.eligibleLoanAmount.toLocaleString("en-IN")}`, highlight: true },
                  ].map(({ l, v, highlight }) => (
                    <div key={l} style={{ background: highlight ? "#f0fdf4" : "#f8fafc", borderRadius: 8, padding: "10px 12px", border: `1px solid ${highlight ? "#bbf7d0" : "#e2e8f0"}` }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 800, color: highlight ? "#065f46" : "#0f172a", fontSize: 15 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: "12px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
                  <div style={{ fontSize: 10, color: "#0369a1", marginBottom: 2 }}>CALCULATED LTV</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: application.calculatedLTV > application.product?.maxLTV ? "#dc2626" : "#1d4ed8" }}>
                    {application.calculatedLTV.toFixed(2)}%
                    <span style={{ fontSize: 11, fontWeight: 400, color: "#64748b", marginLeft: 6 }}>/ {application.product?.maxLTV}% max</span>
                  </div>
                </div>
                {application.adminRemarks && (
                  <div style={{ marginTop: 14, padding: "10px 12px", background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: 10, color: "#92400e", marginBottom: 2 }}>ADMIN REMARKS</div>
                    <div style={{ fontSize: 13, color: "#78350f" }}>{application.adminRemarks}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Collateral table */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", fontFamily: "monospace" }}>PLEDGED COLLATERAL</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["Scheme", "Units", "NAV", "Total Value", "Lending Value"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: h === "Scheme" ? "left" : "right", fontWeight: 600, color: "#64748b", fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {application.collateral?.map(col => (
                      <tr key={col._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{col.schemeName}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{col.isin}</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", color: "#334155" }}>{col.unitsPledged.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", color: "#334155" }}>₹{col.unitNav}</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "#0f172a" }}>₹{col.totalValue.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "#065f46" }}>₹{col.lendingValue.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f8fafc", fontWeight: 800 }}>
                      <td colSpan={3} style={{ padding: "12px 14px", textAlign: "right", color: "#475569", fontSize: 12 }}>Portfolio Total</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#0f172a" }}>₹{application.totalCollateralValue.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#065f46" }}>₹{application.eligibleLoanAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Decision Console */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", fontFamily: "monospace" }}>DECISION CONSOLE</div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>Current Status:</span>
                    <span style={{ borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 700, ...statusStyle(application.status) }}>{application.status}</span>
                  </div>
                  {isClosed ? (
                    <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "8px 0" }}>This application is closed. No further actions.</p>
                  ) : (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {application.status !== "UNDER_REVIEW" && (
                        <button onClick={() => setDialog({ type: "UNDER_REVIEW" })} style={{
                          flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0",
                          background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 13,
                        }}>Mark Under Review</button>
                      )}
                      <button onClick={() => setDialog({ type: "APPROVED" })} style={{
                        flex: 1, padding: "10px", borderRadius: 8, border: "none",
                        background: "#10b981", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
                        boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                      }}>✓ Approve</button>
                      <button onClick={() => setDialog({ type: "REJECTED" })} style={{
                        flex: 1, padding: "10px", borderRadius: 8, border: "none",
                        background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
                        boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                      }}>✗ Reject</button>
                      {application.status === "APPROVED" && (
                        <button onClick={() => setDialog({ type: "DISBURSED" })} style={{
                          width: "100%", padding: "10px", borderRadius: 8, border: "none",
                          background: "#3b82f6", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
                        }}>💸 Mark as Disbursed</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      {dialog && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          backdropFilter: "blur(4px)",
        }} onClick={() => !actionLoading && setDialog(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Confirm: {dialog.type}</h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Update <strong>{application?.applicationId}</strong> to <strong>{dialog.type}</strong>. This cannot be undone.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Remarks (optional)</label>
              <input
                value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Add a note for this decision..."
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
                  border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box",
                  color: "#0f172a",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDialog(null)} disabled={actionLoading} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleAction} disabled={actionLoading} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: dialog.type === "REJECTED" ? "#ef4444" : "#3b82f6",
                color: "#fff", fontWeight: 700, cursor: actionLoading ? "not-allowed" : "pointer",
                opacity: actionLoading ? 0.7 : 1,
              }}>{actionLoading ? "Processing…" : `Confirm ${dialog.type}`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationDetails;
