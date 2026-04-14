import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "sonner";

const RegisterPage = () => {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", panCard:"", phone:"" });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, profile: { firstName: form.firstName, lastName: form.lastName, panCard: form.panCard.toUpperCase(), phone: form.phone } });
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
    background: "rgba(255,255,255,0.07)", color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #134e4a 100%)",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* bg */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"56px 56px", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:460, background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)", borderRadius:20, border:"1px solid rgba(255,255,255,0.10)", padding:"36px 36px", animation:"pageFadeIn 0.4s ease" }}>
        <div style={{ marginBottom:28, textAlign:"center" }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#3b82f6,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none"><path d="M3 15 L10 4 L17 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 11 L14 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/></svg>
          </div>
          <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, marginBottom:4 }}>Create Account</h2>
          <p style={{ color:"rgba(148,163,184,0.8)", fontSize:13 }}>Join the LAMF Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[{id:"firstName",label:"First Name",placeholder:"Rahul"},{id:"lastName",label:"Last Name",placeholder:"Verma"}].map(f => (
              <div key={f.id}>
                <label style={{ display:"block", color:"rgba(203,213,225,0.9)", fontSize:11, fontWeight:700, marginBottom:5, fontFamily:"monospace", letterSpacing:"0.06em" }}>{f.label.toUpperCase()}</label>
                <input id={f.id} style={inp} placeholder={f.placeholder} value={form[f.id]} onChange={handle} required
                  onFocus={e=>e.target.style.borderColor="rgba(96,165,250,0.7)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.14)"} />
              </div>
            ))}
          </div>
          {[
            {id:"email",label:"Email",type:"email",placeholder:"you@example.com"},
            {id:"password",label:"Password",type:"password",placeholder:"Min. 6 characters"},
            {id:"panCard",label:"PAN Card",type:"text",placeholder:"ABCDE1234F"},
            {id:"phone",label:"Phone",type:"tel",placeholder:"9876543210"},
          ].map(f => (
            <div key={f.id}>
              <label style={{ display:"block", color:"rgba(203,213,225,0.9)", fontSize:11, fontWeight:700, marginBottom:5, fontFamily:"monospace", letterSpacing:"0.06em" }}>{f.label.toUpperCase()}</label>
              <input id={f.id} type={f.type} style={inp} placeholder={f.placeholder} value={form[f.id]} onChange={handle} required
                onFocus={e=>e.target.style.borderColor="rgba(96,165,250,0.7)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.14)"} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            padding:"12px", borderRadius:10, border:"none", cursor:loading?"not-allowed":"pointer",
            background:loading?"rgba(59,130,246,0.5)":"linear-gradient(135deg,#3b82f6,#06b6d4)",
            color:"#fff", fontWeight:700, fontSize:15, marginTop:4, boxShadow:"0 4px 20px rgba(59,130,246,0.3)",
          }}>{loading ? "Creating…" : "Create Account →"}</button>
        </form>
        <p style={{ color:"rgba(148,163,184,0.7)", fontSize:13, marginTop:20, textAlign:"center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#60a5fa", textDecoration:"none", fontWeight:600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
