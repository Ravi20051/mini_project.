import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isCompany = token ? JSON.parse(atob(token.split('.')[1])).role === "COMPANY" : false;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data || {});
      } catch (err) {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      // Create payload removing null/empty if needed
      const payload = { ...profile };
      await updateProfile(payload);
      setMessage("Profile updated successfully! ✨");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
      // clear password field so it isn't accidentally submitted again
      setProfile(prev => ({ ...prev, password: "" }));
    }
  };

  const generateResume = () => {
    setSaving(true);
    
    try {
      const resumeEl = document.getElementById("hidden-resume-container");
      // Use native browser printing to generate a perfectly ATS-parseable (text, non-image) PDF!
      const printWindow = window.open('', '', 'height=850,width=850');
      
      printWindow.document.write('<html><head>');
      printWindow.document.write(`<title>${profile.name || 'Student'}_Resume</title>`);
      printWindow.document.write('<style>');
      printWindow.document.write(`
        @page { margin: 0.6in; size: letter portrait; }
        body { 
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
          color: #1c1917; 
          background-color: white;
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(resumeEl.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      // Allow the DOM a moment to parse the inline styles before triggering print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setSaving(false);
      }, 300);
      
    } catch (err) {
      console.error("PDF generation failed:", err);
      setSaving(false);
      setError("Failed to generate PDF resume. Please try again.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:block">
        <div className="h-full px-4 py-8 overflow-y-auto">
          <div className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Overview
            </Link>
            <Link to={isCompany ? "/jobs/manage" : "/applications"} className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCompany ? "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} />
              </svg>
              {isCompany ? "Manage Jobs" : "My Applications"}
            </Link>
            <Link to="/profile" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-brand-50 text-brand-700 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Account Settings</h1>
              <p className="text-slate-500">Update your profile details and preferences.</p>
            </div>
            
            {!isCompany && (
              <button 
                onClick={generateResume}
                disabled={saving}
                className="btn-secondary py-2.5 px-6 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export ATS Resume
                  </>
                )}
              </button>
            )}
          </div>

          {(message || error) && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'} border`}>
              {message ? '✅' : '⚠️'} {message || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* General Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold font-heading text-slate-900">General Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{isCompany ? 'Company Name' : 'Full Name'}</label>
                  <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={profile.email || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" disabled />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>
              </div>
            </div>

            {/* Role Specific Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold font-heading text-slate-900">{isCompany ? 'Company Details' : 'Professional Profile'}</h3>
                {!isCompany && <span className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-bold tracking-wide uppercase">Boost your score!</span>}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {isCompany ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Industry</label>
                      <input type="text" name="industry" value={profile.industry || ''} onChange={handleChange} placeholder="e.g. FinTech, Software, AI" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Website URL</label>
                      <input type="url" name="website" value={profile.website || ''} onChange={handleChange} placeholder="https://example.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">About Us</label>
                      <textarea name="description" value={profile.description || ''} onChange={handleChange} rows="4" placeholder="Describe your company culture and mission..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 resize-none"></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Branch / Major</label>
                      <input type="text" name="branch" value={profile.branch || ''} onChange={handleChange} placeholder="Computer Science" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Graduation Year</label>
                      <input type="number" name="year" value={profile.year || ''} onChange={handleChange} placeholder="2025" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">GitHub URL</label>
                      <input type="url" name="githubUrl" value={profile.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/johndoe" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">LinkedIn / Portfolio URL</label>
                      <input type="url" name="linkedinUrl" value={profile.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/johndoe" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Technical Skills</label>
                      <input type="text" name="skills" value={profile.skills || ''} onChange={handleChange} placeholder="React, Node.js, Spring Boot, MySQL" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                      <p className="text-xs text-slate-400 mt-1.5">Comma separated list of your top skills. These drastically improve your AI Matched Score!</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Security Settings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold font-heading text-slate-900">Security</h3>
              </div>
              <div className="p-6">
                <div className="max-w-md">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                  <input type="password" name="password" value={profile.password || ''} onChange={handleChange} placeholder="Leave blank to keep current password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700" />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200 mt-8">
              <button disabled={saving} type="submit" className="btn-primary py-3 px-8 text-base shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 min-w-[200px]">
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Updating...
                  </>
                ) : (
                  <>
                    Save Profile Changes
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </>
                )}
              </button>
            </div>

          </form>
          
        </div>
      </main>

      {/* Hidden ATS Resume Component */}
      {!isCompany && (
        <div id="hidden-resume-container" className="hidden" style={{ width: '8.5in', padding: '0.4in', backgroundColor: 'white', color: '#1c1917', fontFamily: 'Arial, sans-serif' }}>
          <header style={{ borderBottom: '2px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: '#0f172a', fontWeight: 'bold' }}>{profile.name || "Student Name"}</h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#475569', flexWrap: 'wrap' }}>
              <span>{profile.email}</span>
              {profile.website && <span>• {profile.website}</span>}
              {profile.githubUrl && <span>• {profile.githubUrl}</span>}
              {profile.linkedinUrl && <span>• {profile.linkedinUrl}</span>}
            </div>
          </header>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase' }}>Education</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>Current University</span>
              <span>Expected {profile.year || "2025"}</span>
            </div>
            <div style={{ fontStyle: 'italic', color: '#334155' }}>B.Tech / Major in {profile.branch || "Computer Science"}</div>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase' }}>Technical Skills</h2>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {profile.skills ? profile.skills.split(',').map(s => s.trim()).join(" • ") : "No skills added yet."}
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase' }}>Projects & Experience</h2>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
              <li>Completed academic coursework in Software Engineering and Database Design.</li>
              <li>Actively looking for internship opportunities via InternWait placement system.</li>
              <li>Please visit GitHub or LinkedIn profile for comprehensive project portfolios.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default Profile;
