import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, default as AuthContext } from "./context/AuthContext";
import { useContext, useState } from "react";
import { Toaster } from "sonner";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ApplicationForm from "./pages/ApplicationForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplicationDetails from "./pages/AdminApplicationDetails";
import AdminRoute from "./components/AdminRoute";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <AppSkeleton />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === "ADMIN") return <Navigate to="/admin" />;
  return children;
};

// Full-page skeleton shown while auth is being verified
const AppSkeleton = () => (
  <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "0" }}>
    <div style={{
      height: 64, background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      display: "flex", alignItems: "center",
      padding: "0 32px", gap: 16,
    }}>
      <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 6 }} />
      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
      </div>
    </div>
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="skeleton" style={{ width: 240, height: 32, borderRadius: 8, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 180, height: 18, borderRadius: 6, marginBottom: 32 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
        ))}
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 12 }} />
      ))}
    </div>
  </div>
);

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/new-application" element={<PrivateRoute><ApplicationForm /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/applications/:id" element={<AdminRoute><AdminApplicationDetails /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
