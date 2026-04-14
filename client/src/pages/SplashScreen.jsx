import { useEffect, useState } from "react";

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState("enter"); // enter → hold → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 2400);
    const t3 = setTimeout(() => onDone(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2940 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transition: "opacity 0.5s ease",
        opacity: phase === "exit" ? 0 : 1,
      }}
    >
      {/* Floating orbs */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[
          { w: 300, h: 300, top: "-80px", left: "-80px", color: "rgba(59,130,246,0.12)" },
          { w: 200, h: 200, bottom: "60px", right: "40px", color: "rgba(16,185,129,0.10)" },
          { w: 150, h: 150, top: "30%", right: "15%", color: "rgba(99,102,241,0.10)" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", width: o.w, height: o.h,
            borderRadius: "50%", background: o.color,
            top: o.top, left: o.left, bottom: o.bottom, right: o.right,
            filter: "blur(40px)",
            animation: `floatOrb ${3 + i}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "24px",
        transform: phase === "enter" ? "translateY(20px)" : "translateY(0)",
        opacity: phase === "enter" ? 0 : 1,
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        {/* Logo mark */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(59,130,246,0.4), 0 20px 40px rgba(0,0,0,0.4)",
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 28 L20 10 L32 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22 L28 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="20" cy="10" r="3" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #fff 0%, #93c5fd 60%, #67e8f9 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily: "'Georgia', serif",
            lineHeight: 1.1, marginBottom: 8,
          }}>
            LAMF Portal
          </div>
          <div style={{
            fontSize: 13, color: "rgba(148,163,184,0.9)", letterSpacing: "0.18em",
            textTransform: "uppercase", fontFamily: "monospace",
          }}>
            Lending Against Mutual Funds
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[
            { label: "Secure", icon: "🔒" },
            { label: "Fast Disbursal", icon: "⚡" },
            { label: "Low Interest", icon: "📉" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 100, padding: "6px 14px", fontSize: 12,
              color: "rgba(203,213,225,0.9)", display: "flex", alignItems: "center", gap: 6,
              backdropFilter: "blur(8px)",
              animation: `fadeInUp 0.5s ease forwards`,
              animationDelay: `${0.3 + i * 0.1}s`, opacity: 0,
            }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </div>

        {/* Loader bar */}
        <div style={{
          width: 200, height: 3, background: "rgba(255,255,255,0.1)",
          borderRadius: 100, overflow: "hidden", marginTop: 8,
        }}>
          <div style={{
            height: "100%", borderRadius: 100,
            background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
            animation: "loadBar 2s ease forwards",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes floatOrb { from { transform: translateY(0); } to { transform: translateY(-20px); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
