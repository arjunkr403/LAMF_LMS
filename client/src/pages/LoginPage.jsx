import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") { setEmail("admin@lamf.com"); setPassword("password123"); }
    else { setEmail("rahul.verma@example.com"); setPassword("password123"); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #134e4a 100%)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Georgia', serif",
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: -120, left: -120,
          width: 500, height: 500, borderRadius: "50%",
          background: "rgba(59,130,246,0.10)", filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(16,185,129,0.08)", filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
      </div>

      {/* Left Panel — Branding */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "64px",
        display: window.innerWidth < 900 ? "none" : "flex",
      }}>
        <div style={{ maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(59,130,246,0.35)",
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M4 20 L13 6 L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 15 L19 15" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>LAMF Portal</div>
              <div style={{ color: "rgba(148,163,184,0.8)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
                Lending Against Mutual Funds
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1.15,
            color: "#fff", marginBottom: 20, letterSpacing: "-0.02em",
          }}>
            Unlock liquidity<br />
            <span style={{
              background: "linear-gradient(90deg, #60a5fa, #34d399)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>without selling</span><br />
            your funds.
          </h1>

          <p style={{ color: "rgba(148,163,184,0.85)", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Pledge your mutual fund portfolio as collateral and get instant loan disbursal at competitive interest rates.
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { value: "50%", label: "Max LTV on Equity" },
              { value: "8.5%", label: "Interest from p.a." },
              { value: "24h", label: "Avg. Disbursal" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12, padding: "16px 12px",
                backdropFilter: "blur(8px)",
              }}>
                <div style={{ color: "#60a5fa", fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: "rgba(148,163,184,0.8)", fontSize: 11, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login form */}
      <div style={{
        width: "100%", maxWidth: 460,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 40px",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        animation: "pageFadeIn 0.4s ease",
      }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: "rgba(148,163,184,0.8)", fontSize: 14 }}>Access your loan dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", color: "rgba(203,213,225,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.05em" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                background: "rgba(255,255,255,0.07)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.14)",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(96,165,250,0.7)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.14)"}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(203,213,225,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.05em" }}>
              PASSWORD
            </label>
            <input
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                background: "rgba(255,255,255,0.07)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.14)",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(96,165,250,0.7)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.14)"}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: "13px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
              color: "#fff", fontWeight: 700, fontSize: 15, marginTop: 4,
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Demo quick-fill */}
        <div style={{
          marginTop: 24, padding: "16px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 12, marginBottom: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}>
            DEMO QUICK-FILL
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Admin", role: "admin" },
              { label: "Borrower", role: "user" },
            ].map(d => (
              <button key={d.role} onClick={() => fillDemo(d.role)} style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(203,213,225,0.9)", fontSize: 12, cursor: "pointer", fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseOver={e => e.target.style.background = "rgba(59,130,246,0.2)"}
              onMouseOut={e => e.target.style.background = "rgba(255,255,255,0.07)"}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 13, marginTop: 20, textAlign: "center" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
