import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // Default role
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload = role === "COMPANY" 
        ? { companyName: name, email, password, role }
        : { name, email, password, role };
        
      await API.post(`/auth/${role.toLowerCase()}/register`, payload);
      // Optionally login immediately or redirect
      navigate(role === "STUDENT" ? "/student-login" : "/company-login");
    } catch (err) {
      setError("Registration failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 selection:bg-brand-200 selection:text-brand-900 pb-20 pt-10">
      
      {/* Decorative Blob */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="w-full max-w-3xl card-premium bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-10 border border-white">
        
        {/* Left Info Panel */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-brand-600 to-indigo-700 p-10 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="text-white text-2xl font-heading font-bold mb-8 block tracking-tight">
              InternMenu
            </Link>
            <h2 className="text-3xl font-bold font-heading mb-4 leading-snug">
              Begin your <br/>journey today.
            </h2>
            <p className="text-brand-100 text-sm leading-relaxed opacity-90">
              Create an account to gain full access to exclusive internship opportunities or top-tier student candidates.
            </p>
          </div>
          
          <div className="mt-12 hidden lg:block">
            <div className="p-5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <p className="text-sm italic text-brand-50 mb-3">
                "Finding our engineering interns through this platform saved us weeks of sorting through resumes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-xs font-bold font-heading">S</div>
                <div className="text-xs">
                  <p className="font-bold">Sarah Jenkins</p>
                  <p className="text-brand-200">HR at TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-8 sm:p-10 lg:p-12">
          
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 text-sm mb-8">Fill in your details to get started with InternWait.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={register} className="space-y-5">
            
            {/* Account Type Selector */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === "STUDENT" 
                    ? "bg-white shadow-sm text-brand-700 border border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setRole("COMPANY")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === "COMPANY" 
                    ? "bg-white shadow-sm text-indigo-700 border border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                I'm an Employer
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name or Company Name</label>
              <input
                type="text"
                required
                placeholder={role === "STUDENT" ? "John Doe" : "Acme Corp"}
                className="input-field"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder={role === "STUDENT" ? "student@university.edu" : "hr@company.com"}
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                placeholder="Create a strong password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 text-base rounded-xl text-white font-medium shadow-lg transition-all transform hover:-translate-y-0.5 mt-6 ${
                role === "COMPANY" 
                  ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20" 
                  : "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-brand-500/30"
              }`}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link 
              to={role === "COMPANY" ? "/company-login" : "/student-login"} 
              className={`font-medium transition-colors ${role === "COMPANY" ? "text-slate-900 hover:text-indigo-600" : "text-brand-600 hover:text-brand-500"}`}
            >
              Sign in instead
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;