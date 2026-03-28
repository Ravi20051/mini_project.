import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/admin/login", {
        email,
        password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-200 selection:text-brand-900 bg-slate-900 items-center justify-center p-4">
      {/* Centered Login Form for Admin (different look than student/company) */}
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        {/* Top edge color accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">TPO Portal Access</h2>
          <p className="text-slate-500 text-sm">Secure authorization required for placement officers.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={login} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@college.edu"
                className="input-field bg-slate-50"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Master Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field bg-slate-50"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all duration-300 mt-8"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Authenticate"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-600 transition-colors">
            Return to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
