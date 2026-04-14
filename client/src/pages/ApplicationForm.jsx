import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "sonner";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [collateral, setCollateral] = useState([{ schemeName: "", isin: "", units: "", currentNav: "" }]);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/products")
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setProductsLoading(false));
  }, []);

  const addRow = () => setCollateral([...collateral, { schemeName: "", isin: "", units: "", currentNav: "" }]);
  const removeRow = (i) => collateral.length > 1 && setCollateral(collateral.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const next = [...collateral];
    next[i][field] = field === "isin" ? val.toUpperCase() : val;
    setCollateral(next);
  };

  const totalCollateral = collateral.reduce((s, c) => s + (Number(c.units)||0)*(Number(c.currentNav)||0), 0);
  const selectedObj = products.find(p => p._id === selectedProduct);
  const eligible = selectedObj ? totalCollateral * (selectedObj.maxLTV / 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) { toast.error("Select a loan product"); return; }
    if (collateral.some(c => !c.schemeName || !c.isin || !c.units || !c.currentNav)) {
      toast.error("Fill all collateral fields"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/applications", {
        productId: selectedProduct,
        requestedLoanAmount: Number(requestedAmount),
        collateral: collateral.map(c => ({ ...c, units: Number(c.units), currentNav: Number(c.currentNav) })),
      });
      toast.success("Application submitted!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed";
      const eligible = err.response?.data?.eligibleAmount;
      toast.error(eligible ? `${msg} — Max: ₹${eligible.toLocaleString("en-IN")}` : msg);
    } finally { setSubmitting(false); }
  };

  const inp = {
    padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: 13, outline: "none", color: "#0f172a", width: "100%", boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <div className="page-enter" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Nav */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 15 L10 4 L17 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 11 L14 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: 17 }}>LAMF Portal</span>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{
          padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: "transparent", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer",
        }}>← Back to Dashboard</button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 32px 64px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>New Loan Application</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Pledge your mutual fund holdings as collateral</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Step 1 */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 100, background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Select Loan Product</span>
            </div>
            <div style={{ padding: 22 }}>
              {productsLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 10 }} />)}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
                  {products.map(p => (
                    <div key={p._id} onClick={() => setSelectedProduct(p._id)} style={{
                      borderRadius: 10, border: selectedProduct === p._id ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                      padding: 16, cursor: "pointer", background: selectedProduct === p._id ? "#eff6ff" : "#fff",
                      transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                          background: p.type === "EQUITY" ? "#dbeafe" : p.type === "DEBT" ? "#d1fae5" : "#f3e8ff",
                          color: p.type === "EQUITY" ? "#1d4ed8" : p.type === "DEBT" ? "#065f46" : "#7c3aed",
                        }}>{p.type}</span>
                        {selectedProduct === p._id && <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 8 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        <div>{p.interestRate}% p.a. · {p.maxLTV}% Max LTV</div>
                        <div style={{ marginTop: 2 }}>₹{(p.minLoanAmount/1000).toFixed(0)}K – ₹{(p.maxLoanAmount/100000).toFixed(0)}L</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 100, background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Add Mutual Fund Holdings</span>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              {collateral.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 2fr 1fr 1fr auto", gap: 10, alignItems: "end", background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Scheme Name</label>
                    <input style={inp} placeholder="HDFC Top 100 Fund" value={item.schemeName} onChange={e => updateRow(i, "schemeName", e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>ISIN</label>
                    <input style={inp} placeholder="INF..." value={item.isin} onChange={e => updateRow(i, "isin", e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Units</label>
                    <input style={inp} type="number" placeholder="0" min="0" value={item.units} onChange={e => updateRow(i, "units", e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>NAV (₹)</label>
                    <input style={inp} type="number" placeholder="0.00" min="0" step="0.01" value={item.currentNav} onChange={e => updateRow(i, "currentNav", e.target.value)} required />
                  </div>
                  <button type="button" onClick={() => removeRow(i)} disabled={collateral.length === 1} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid #fecaca", background: "#fff5f5",
                    color: "#ef4444", cursor: collateral.length === 1 ? "not-allowed" : "pointer", fontSize: 16,
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: collateral.length === 1 ? 0.4 : 1,
                    flexShrink: 0,
                  }}>✕</button>
                </div>
              ))}

              <button type="button" onClick={addRow} style={{
                padding: "10px", borderRadius: 10, border: "2px dashed #cbd5e1",
                background: "#f8fafc", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 13,
                transition: "all 0.15s",
              }}
              onMouseOver={e => { e.target.style.borderColor="#3b82f6"; e.target.style.color="#3b82f6"; }}
              onMouseOut={e => { e.target.style.borderColor="#cbd5e1"; e.target.style.color="#64748b"; }}
              >+ Add Another Fund</button>

              {totalCollateral > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                  <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "14px 16px", border: "1px solid #bae6fd" }}>
                    <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 600, marginBottom: 4 }}>PORTFOLIO VALUE</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0c4a6e" }}>₹{totalCollateral.toLocaleString("en-IN")}</div>
                  </div>
                  {selectedObj && (
                    <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
                      <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginBottom: 4 }}>MAX ELIGIBLE ({selectedObj.maxLTV}% LTV)</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#14532d" }}>₹{eligible.toLocaleString("en-IN")}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 100, background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>3</div>
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Loan Amount</span>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ maxWidth: 280 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Requested Amount (₹)</label>
                <input style={{ ...inp, fontSize: 16, fontWeight: 700 }} type="number" placeholder="e.g. 200000" min="0" value={requestedAmount} onChange={e => setRequestedAmount(e.target.value)} required />
                {selectedObj && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Limits: ₹{selectedObj.minLoanAmount.toLocaleString("en-IN")} – ₹{selectedObj.maxLoanAmount.toLocaleString("en-IN")}</p>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={() => navigate("/dashboard")} style={{
              padding: "11px 22px", borderRadius: 10, border: "1px solid #e2e8f0",
              background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14,
            }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{
              padding: "11px 32px", borderRadius: 10, border: "none",
              background: submitting ? "rgba(59,130,246,0.6)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14,
              boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            }}>{submitting ? "Submitting…" : "Submit Application →"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
