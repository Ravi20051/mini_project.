import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompanyJobs, deleteJob } from "../services/api";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const res = await getCompanyJobs();
      setJobs(res.data || []);
    } catch (err) {
      setError("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      setJobs(jobs.filter(job => job.id !== id));
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
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
            <Link to="/jobs/manage" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-brand-50 text-brand-700">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Manage Jobs
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
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900 mb-1">Manage Jobs</h1>
              <p className="text-slate-500">View, edit, and manage all your posted listings.</p>
            </div>
            <Link to="/jobs/post" className="btn-primary shadow-sm py-2 px-5 flex items-center">
              <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a New Job
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="card-premium overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">No Jobs Posted Yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't posted any job listings. Click the button above to create your first listing.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Job Title</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => (
                      <tr key={job.id} className="bg-white hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{job.title}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{job.salary || "Salary not specified"}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {job.location || "Not specified"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {job.status || 'OPEN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/jobs/${job.id}/applicants`} 
                            className="text-indigo-600 hover:text-indigo-900 font-medium mr-4 transition-colors"
                          >
                            View Applicants
                          </Link>
                          <Link 
                            to={`/jobs/edit/${job.id}`} 
                            className="text-brand-600 hover:text-brand-900 font-medium mr-4 transition-colors"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(job.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default ManageJobs;
