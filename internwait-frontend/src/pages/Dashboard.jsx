import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../services/api";

function Dashboard() {
  const [data, setData] = useState({
    totalJobs: 0,
    totalStudents: 0,
    totalApplications: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);

  // Parse token to get user context
  const token = localStorage.getItem("token");
  const isCompany = token ? JSON.parse(atob(token.split('.')[1])).role === "COMPANY" : false;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();
        setData(res.data || { totalJobs: 0, totalStudents: 0, totalApplications: 0 });
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchRecs = async () => {
      try {
        if (!isCompany) {
          const { getStudentAIRecommendations } = await import("../services/api");
          const res = await getStudentAIRecommendations();
          if (Array.isArray(res.data)) {
            setRecommendations(res.data);
          } else if (typeof res.data === 'string') {
            try {
              setRecommendations(JSON.parse(res.data));
            } catch (e) {
              setRecommendations([]);
            }
          }
        }
      } catch (err) {
        console.error("AI Recs error", err);
      } finally {
        setRecsLoading(false);
      }
    };
    fetchDashboard();
    fetchRecs();
  }, [isCompany]);

  const stats = [
    { title: "Total Jobs", value: data.totalJobs, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Students", value: data.totalStudents, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-brand-600", bg: "bg-brand-100" },
    { title: "Applications", value: data.totalApplications, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-emerald-600", bg: "bg-emerald-100" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-20">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:block">
        <div className="h-full px-4 py-8 overflow-y-auto">
          <div className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-brand-50 text-brand-700">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <Link to="/profile" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          
          <div className="mb-10">
            {isCompany ? (
              <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">
                    {data.userName ? `Welcome back, ${data.userName}! 🏢` : "Welcome back! 🏢"}
                  </h1>
                  <p className="text-brand-100 text-lg">
                    Here's an overview of your hiring operations and AI applicant screening today.
                  </p>
                </div>
                <div className="relative z-10 shrink-0">
                  <Link to="/jobs/post" className="bg-white text-brand-700 hover:bg-brand-50 shadow-md py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post a New Job
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-2">
                    {data.userName ? `Ready to launch your career, ${data.userName}? 🚀` : "Ready to launch your career? 🚀"}
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    Your daily AI-powered internship insights are ready. Let's get you hired!
                  </p>
                </div>
                <div className="relative z-10 shrink-0">
                  <Link to="/jobs" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-md py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Browse New Jobs
                  </Link>
                </div>
              </div>
            )}
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               {[1,2,3].map(i => (
                 <div key={i} className="card-premium p-6 animate-pulse">
                   <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4"></div>
                   <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                   <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {isCompany ? (
                // Company Stats
                stats.map((stat, i) => (
                  <div key={i} className="card-premium p-6 flex flex-col justify-between group">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                      <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold font-heading text-slate-900 mt-4 tracking-tight">{stat.value}</h3>
                  </div>
                ))
              ) : (
                // Student Analytics Dashboard
                <>
                  <div className="card-premium p-6 flex flex-col justify-between group">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-500">Applications Sent</p>
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-4">
                      <h3 className="text-4xl font-bold font-heading text-slate-900 tracking-tight">{data.studentTotalApplied || 0}</h3>
                      <span className="text-sm text-slate-500 font-medium">total jobs</span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
                      <span>{data.studentTotalAccepted || 0} Accepted / {data.studentTotalRejected || 0} Rejected</span>
                    </div>
                  </div>

                  <div className="card-premium p-6 flex flex-col justify-between group">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-500">Success Rate</p>
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold font-heading text-slate-900 mt-4 tracking-tight">{data.successRate || 0}%</h3>
                    <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
                      <span>Based on company responses</span>
                    </div>
                  </div>

                  <div className="card-premium p-6 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between relative z-10">
                      <p className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </span>
                        🤖 AI Career Assistant
                      </p>
                    </div>
                    <div className="mt-4 text-sm font-medium text-slate-700 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 leading-relaxed relative z-10 shadow-inner">
                      <span className="text-indigo-800 font-semibold block mb-1">Coach Insight:</span>
                      "{data.commonWeakness || 'Applying to more jobs will generate deeper insights. Keep going!'}"
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI Perfect Match Jobs */}
          {!isCompany && (
            <div className="card-premium p-6 mb-10 overflow-hidden relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🎯</span> AI "Perfect Match" Alerts
                  </h3>
                  <p className="text-sm text-slate-500">Gemini-powered job recommendations based on your skills profile</p>
                </div>
                {recsLoading && (
                  <div className="flex items-center gap-2 text-brand-600 text-sm font-medium">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                )}
              </div>
              
              {!recsLoading && recommendations.length === 0 && (
                 <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500">No AI recommendations available yet. Try updating your skills in your profile!</p>
                 </div>
              )}

              {!recsLoading && recommendations.length > 0 && (
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{rec.title}</h4>
                          <span className="bg-brand-50 text-brand-700 text-xs px-2 py-0.5 rounded font-medium">98% Match</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{rec.companyName}</p>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-900 italic relative">
                           <div className="absolute top-3 left-3 opacity-30">
                             <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                           </div>
                           <span className="pl-6 block">{rec.reason}</span>
                        </div>
                      </div>
                      <Link to={`/jobs`} className="shrink-0 btn-secondary py-2 px-4 whitespace-nowrap">
                        View Jobs
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions / Activity */}
          <div className="card-premium overflow-hidden mt-2">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold font-heading text-slate-900">{isCompany ? "Action Required: Applicant Reviews" : "Recent Activity"}</h3>
            </div>
            <div className="p-8 pb-10 text-center flex flex-col items-center justify-center">
              {isCompany ? (
                <>
                  <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Evaluate Your Candidates</h4>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Our AI assistants have pre-screened your applicants. Click below to view the <strong>AI Evaluation Reports</strong> and make your final Human Decision to Accept or Reject candidates.
                  </p>
                  <Link to="/jobs/manage" className="btn-primary shadow-md py-2.5 px-6 font-semibold flex items-center gap-2">
                    Review Applicants Now
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Keep up the momentum!</h4>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    The more jobs you apply to, the more accurate your <strong>AI Career Assistant</strong> becomes. Start browsing new internships now to increase your odds of placement.
                  </p>
                  <Link to="/jobs" className="btn-primary shadow-md py-2.5 px-6 font-semibold">
                    Browse New Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;