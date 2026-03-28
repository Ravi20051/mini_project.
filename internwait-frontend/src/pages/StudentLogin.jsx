import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function StudentLogin() {
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
      const res = await API.post("/auth/student/login", {
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
    <div className="min-h-screen flex selection:bg-brand-200 selection:text-brand-900">
      {/* Left Panel - Branding/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <Link to="/" className="text-white text-3xl font-heading font-bold mb-12 tracking-tight">
            Intern<span className="text-brand-300">Wait</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold font-heading text-white leading-tight mb-6">
            Your career starts right here.
          </h1>
          <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
            Join thousands of students who found their dream internships through our platform. Sign in to continue your journey.
          </p>
          
          <div className="mt-16 flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className={`w-12 h-12 rounded-full border-2 border-indigo-900 flex items-center justify-center text-white font-bold bg-indigo-${i*100+400} shadow-md`}>
                  S{i}
                </div>
              ))}
            </div>
            <div className="text-indigo-100 text-sm">
              <span className="font-bold text-white">10k+</span> students placed
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white shrink-0">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden text-3xl font-heading font-bold mb-10 block tracking-tight">
            Intern<span className="text-brand-600">Wait</span>
          </Link>
          
          <div className="mb-10 lg:mb-12">
            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-3 ml-2">Welcome back</h2>
            <p className="text-slate-500 ml-2">Please enter your student credentials to log in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className="input-field"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
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
              className="btn-primary w-full py-3.5 text-base mt-8"
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
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
              Create an account
            </Link>
          </div>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            Are you an employer?{' '}
            <Link to="/company-login" className="font-medium text-slate-900 hover:text-brand-600 transition-colors">
              Company Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;