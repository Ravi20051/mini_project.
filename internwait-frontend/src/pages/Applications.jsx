import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentApplications } from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await getStudentApplications();
        setApplications(res.data || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Accepted</span>;
      case "REJECTED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Applied</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 selection:bg-brand-200 selection:text-brand-900">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-8 mb-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">My Applications</h1>
              <p className="text-slate-500">Track the status of your internship applications.</p>
            </div>
            <Link to="/jobs" className="btn-primary shadow-sm py-2 px-5 hidden md:block">
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-brand-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-500 font-medium text-lg">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card-premium p-12 text-center border-dashed border-2 border-slate-200 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-6">Looks like you haven't applied to any internships yet. Start exploring and send your first application today!</p>
            <Link to="/jobs" className="btn-primary py-2.5 px-6 inline-flex shadow-sm">
              Explore Opportunities
            </Link>
          </div>
        ) : (
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job Details</th>
                    <th className="px-6 py-4 font-semibold hidden md:table-cell">AI Evaluation</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => {
                    const job = app.job || {};
                    return (
                      <tr key={app.applicationId} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-lg font-bold text-slate-400">
                                {job.companyName ? job.companyName.charAt(0).toUpperCase() : "C"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-heading font-semibold text-base text-slate-900">
                                {job.title || "Unknown Job"}
                              </h4>
                              <p className="text-slate-500 text-sm mt-0.5">{job.companyName || "Unknown Company"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell align-top text-sm">
                          {app.aiMatchScore ? (
                            <div className="flex flex-col gap-1.5 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                  app.aiMatchScore >= 80 ? 'bg-green-100 text-green-800' :
                                  app.aiMatchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {app.aiMatchScore}% Match
                                </span>
                              </div>
                              {app.aiFeedback && (
                                <p className="text-slate-600 italic text-xs leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                                  {app.aiFeedback}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic font-medium">No evaluation</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center align-top">
                          <div className="flex flex-col items-center gap-2">
                            {getStatusBadge(app.status)}
                            {app.status === 'REJECTED' && app.rejectionReason && (
                              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-md w-full max-w-[150px] leading-snug">
                                <span className="font-semibold block mb-0.5">Reason:</span>
                                {app.rejectionReason}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
