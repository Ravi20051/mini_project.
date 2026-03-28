import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = token
    ? role === "ADMIN"
      ? [
          { name: "Admin Dashboard", path: "/admin/dashboard" }
        ]
      : [
          { name: "Explore Jobs", path: "/jobs" },
          { name: "Dashboard", path: "/dashboard" },
        ]
    : [
        { name: "Home", path: "/" },
        { name: "Explore Jobs", path: "/jobs" },
      ];

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-white/20 ${
        isScrolled ? "py-3 shadow-sm" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
              IW
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">
              Intern<span className="text-brand-600">Wait</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                  location.pathname === link.path ? "text-brand-600" : "text-slate-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <button onClick={logout} className="btn-secondary py-2 px-5 text-sm">
                Logout
              </button>
            ) : (
              <>
                <Link to="/student-login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-2.5 px-6 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;