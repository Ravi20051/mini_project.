import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobApplications, updateApplicationStatus, getJobById, exportJobApplicationsCSV } from "../services/api";

function JobApplicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          getJobById(id),
          getJobApplications(id)
        ]);
        setJob(jobRes.data);
        setApplicants(appsRes.data || []);
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const payload = newStatus === 'REJECTED' ? { status: newStatus, reason: rejectReason } : { status: newStatus };
      await updateApplicationStatus(appId, newStatus); // Wait, frontend updateApplicationStatus uses {status}. I need to update it in api.js too or pass the payload.
      // ACTUALLY, I will rely on updating api.js if needed, or I'll just change the params passed:
      
      // Let's modify the function to accept reason:
      // But updateApplicationStatus in api.js expects (appId, status).
      // I'll import axios or fix api.js in the next step.
      // Wait, api.js: export const updateApplicationStatus = (appId, status) => API.put(`/company/application/${appId}/status`, { status });
      // I will need to update api.js first. I'll just use a local axios call or update api.js in the next file change.
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const confirmStatusChange = async (appId, newStatus, reason = "") => {
    try {
      // Import API directly if needed, or use the modified api helper later
      // The instruction asks to send it. I'll update api.js right after this.
      await updateApplicationStatus(appId, newStatus, reason);
      setApplicants(apps => apps.map(app => 
        app.applicationId === appId ? { ...app, status: newStatus, rejectionReason: reason } : app
      ));
      if (newStatus === 'REJECTED') {
        setRejectingAppId(null);
        setRejectReason("");
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportJobApplicationsCSV(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants_job_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to export candidates as CSV.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link to="/jobs/manage" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Manage Jobs
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3">
              Applicants for {job ? job.title : "this Job"}
            </h1>
            <p className="text-slate-500 mt-2 flex items-center">
              Review and directly manage student applications.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm py-2 px-4 rounded-xl font-semibold transition-all flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="card-premium overflow-hidden">
          {applicants.length === 0 ? (
            <div className="p-12 text-center border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">No Applicants Yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">No students have applied to this job posting yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/4">Candidate Info</th>
                    <th className="px-6 py-4 font-semibold w-2/4">AI Evaluation Report</th>
                    <th className="px-6 py-4 font-semibold text-right w-1/4">Human Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.map(app => (
                    <tr key={app.applicationId} className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-5 font-medium text-slate-900 align-top">
                        <div className="font-semibold text-lg text-slate-900 mb-0.5">{app.studentName}</div>
                        <a href={`mailto:${app.studentEmail}`} className="text-indigo-600 hover:text-indigo-800 hover:underline font-normal text-sm flex items-center gap-1 mb-3">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {app.studentEmail}
                        </a>
                        
                        <div className="space-y-1.5 border-l-2 border-slate-200 pl-3 mb-4">
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Branch:</span> {app.studentBranch || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">Year:</span> {app.studentYear || 'N/A'}
                          </div>
                        </div>

                        {app.studentSkills && (
                          <div className="mb-4">
                            <span className="font-semibold text-xs text-slate-800 block mb-1.5">Top Skills:</span>
                            <div className="flex flex-wrap gap-1.5">
                               {app.studentSkills.split(',').map((skill, i) => (
                                 <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200 shadow-sm">{skill.trim()}</span>
                               ))}
                            </div>
                          </div>
                        )}

                        {(app.studentLinkedin || app.studentPortfolio) && (
                          <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {app.studentLinkedin && (
                               <a href={app.studentLinkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:text-blue-800 hover:underline text-[11px] font-semibold flex items-center gap-1.5">
                                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                 LinkedIn Profile
                               </a>
                            )}
                            {app.studentPortfolio && (
                               <a href={app.studentPortfolio} target="_blank" rel="noreferrer" className="text-purple-700 hover:text-purple-800 hover:underline text-[11px] font-semibold flex items-center gap-1.5">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                 Personal Portfolio
                               </a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                          {/* Decorative Background */}
                          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 ${
                            app.aiMatchScore >= 80 ? 'bg-green-400' : app.aiMatchScore >= 50 ? 'bg-blue-400' : 'bg-red-400'
                          }`}></div>
                          
                          <div className="flex items-start gap-6 relative z-10">
                            {/* Scores */}
                            <div className="flex flex-col gap-4 shrink-0 pt-1">
                              {/* Resume Match Score */}
                              <div className="flex flex-col items-center">
                                <div className="relative w-14 h-14 flex items-center justify-center mb-1">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                                    <circle 
                                      cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                                      strokeDasharray={24 * 2 * Math.PI}
                                      strokeDashoffset={24 * 2 * Math.PI * (1 - ((app.aiMatchScore || 0) / 100))}
                                      className={`transition-all duration-1000 ease-out ${
                                        app.aiMatchScore >= 80 ? 'text-green-500' :
                                        app.aiMatchScore >= 50 ? 'text-blue-500' : 'text-red-500'
                                      }`}
                                      strokeLinecap="round" 
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-bold text-xs text-slate-800 leading-none">{app.aiMatchScore || 0}%</span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold text-center leading-tight">Resume<br/>Match</span>
                              </div>
                              
                              {/* Interview Score */}
                              {app.interviewScore !== undefined && app.interviewScore !== null && (
                                <div className="flex flex-col items-center mt-2">
                                  <div className="relative w-14 h-14 flex items-center justify-center mb-1">
                                    <svg className="w-full h-full transform -rotate-90">
                                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                                      <circle 
                                        cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                                        strokeDasharray={24 * 2 * Math.PI}
                                        strokeDashoffset={24 * 2 * Math.PI * (1 - (app.interviewScore / 100))}
                                        className={`transition-all duration-1000 ease-out ${
                                          app.interviewScore >= 80 ? 'text-indigo-500' :
                                          app.interviewScore >= 50 ? 'text-purple-500' : 'text-rose-500'
                                        }`}
                                        strokeLinecap="round" 
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="font-bold text-xs text-slate-800 leading-none">{app.interviewScore}%</span>
                                    </div>
                                  </div>
                                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold text-center leading-tight">Mock<br/>Interview</span>
                                </div>
                              )}
                            </div>
                            
                            {/* AI Text Report */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  app.aiMatchScore >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                                  app.aiMatchScore >= 50 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  app.aiMatchScore > 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {app.aiMatchScore >= 80 ? '🔥 AI Suggests: Shortlist' : 
                                   app.aiMatchScore >= 50 ? '👍 AI Suggests: Review' : 
                                   app.aiMatchScore > 0 ? '⚠️ AI Suggests: Reject' : 'Not Evaluated'}
                                </span>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resume Feedback</h4>
                                  {app.aiFeedback ? (
                                    <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                                      "{app.aiFeedback}"
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">No AI insights generated for this candidate's resume.</p>
                                  )}
                                </div>
                                
                                {app.interviewFeedback && (
                                  <div>
                                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Interview Feedback</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-indigo-300 pl-3">
                                      "{app.interviewFeedback}"
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/60">
                                {app.resumeFilename && (
                                  <a href={`http://localhost:8080/api/applications/resume/${app.resumeFilename}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-800 text-xs font-semibold flex items-center gap-1 group">
                                    <span className="p-1 bg-brand-50 rounded group-hover:bg-brand-100 transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </span>
                                    Scan Resume
                                  </a>
                                )}
                                {app.githubLink && (
                                  <a href={app.githubLink} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 group">
                                    <span className="p-1 bg-slate-100 rounded group-hover:bg-slate-200 transition-colors">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path></svg>
                                    </span>
                                    Proof of Work
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5 text-right align-top">
                        <div className="flex flex-col gap-3 items-end h-full">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            Status: {app.status || 'APPLIED'}
                          </span>
                          
                          {app.status === 'APPLIED' ? (
                            <div className="flex flex-col gap-2 items-end w-full max-w-[160px]">
                              <button 
                                onClick={() => confirmStatusChange(app.applicationId, 'ACCEPTED')}
                                className="w-full flex justify-center items-center px-3 py-1.5 border border-emerald-500 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-500 hover:text-white font-semibold transition-all text-xs shadow-sm"
                              >
                                ✓ Accept Candidate
                              </button>
                              
                              {rejectingAppId === app.applicationId ? (
                                <div className="flex flex-col gap-1.5 items-end bg-white p-2 rounded-lg border border-slate-300 shadow-md w-full animate-in fade-in zoom-in duration-200">
                                  <label className="text-[10px] text-slate-500 font-bold uppercase">Reason for Rejection</label>
                                  <select 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="text-xs border border-slate-300 rounded px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-rose-500"
                                  >
                                    <option value="" disabled>Select Reason...</option>
                                    <option value="Lack of required skills">Lack of required skills</option>
                                    <option value="Insufficient experience">Insufficient experience</option>
                                    <option value="Weak projects/portfolio">Weak portfolio</option>
                                    <option value="Role filled">Role filled</option>
                                  </select>
                                  <div className="flex gap-1.5 w-full mt-1">
                                    <button onClick={() => confirmStatusChange(app.applicationId, 'REJECTED', rejectReason)} disabled={!rejectReason} className="flex-1 text-[10px] font-bold bg-rose-600 text-white py-1 rounded disabled:opacity-50 hover:bg-rose-700 transition-colors">Confirm</button>
                                    <button onClick={() => setRejectingAppId(null)} className="flex-1 text-[10px] font-bold bg-slate-100 text-slate-600 py-1 rounded hover:bg-slate-200 transition-colors">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setRejectingAppId(app.applicationId)}
                                  className="w-full flex justify-center items-center px-3 py-1.5 border border-slate-300 bg-white text-slate-600 rounded-lg hover:border-rose-500 hover:text-rose-600 font-semibold transition-all text-xs shadow-sm"
                                >
                                  ✕ Reject Candidate
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-400 font-medium text-xs flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Human Reviewed
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default JobApplicants;
