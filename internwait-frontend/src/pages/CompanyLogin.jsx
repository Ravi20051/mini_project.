import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function CompanyLogin() {
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
      const res = await API.post("/auth/company/login", {
        email,
        password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse selection:bg-brand-200 selection:text-brand-900">
      {/* Right Panel - Branding/Marketing (Reversed for Company) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-950 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full">
          <Link to="/" className="text-white text-3xl font-heading font-bold mb-12 tracking-tight text-right block w-full">
            Intern<span className="text-indigo-400">Wait</span> <span className="font-normal text-slate-400 text-lg">for Employers</span>
          </Link>
          <div className="text-right">
            <h1 className="text-4xl xl:text-5xl font-bold font-heading text-white leading-tight mb-6">
              Hire the top 1% of <br/>student talent.
            </h1>
            <p className="text-lg text-slate-300 max-w-md ml-auto leading-relaxed">
              Post jobs, track applications, and make your next great hire. 
              Join the companies building the future with our candidate pool.
            </p>
          </div>
        </div>
      </div>

      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white shrink-0">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden text-3xl font-heading font-bold mb-10 block tracking-tight">
            Intern<span className="text-indigo-600">Wait</span> <span className="text-sm font-normal text-slate-500">Employer</span>
          </Link>
          
          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-3 ml-2">Employer Login</h2>
            <p className="text-slate-500 ml-2">Access your company dashboard and manage listings.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="input-field"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-8"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Are you a student?{' '}
            <Link to="/student-login" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyLogin;