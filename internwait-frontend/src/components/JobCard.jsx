import ApplyButton from "./ApplyButton";
import { Link } from "react-router-dom";

function JobCard({ job }) {
  // Placeholder images and tags for a more real-world feel
  const renderTags = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-3 py-1 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-100">
          {job.jobType || "Full-time"}
        </span>
        <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          {job.location || "Remote"}
        </span>
      </div>
    );
  };

  return (
    <div className="card-premium p-6 flex flex-col h-full bg-white relative overflow-hidden group">
      {/* Subtle decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shadow-sm">
            {/* Fallback avatar if no company logo */}
            <span className="text-xl font-bold text-slate-400">
              {job.companyName ? job.companyName.charAt(0).toUpperCase() : "C"}
            </span>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">{job.companyName}</p>
          </div>
        </div>
        {/* Salary or Type badge */}
        <div className="text-right hidden sm:block">
          <span className="text-sm font-medium text-slate-700">$80k - $120k</span>
        </div>
      </div>

      <div className="mt-4 relative z-10 flex-grow">
        <p className="text-slate-600 text-sm line-clamp-2">
          {job.description || "We are looking for a talented individual to join our team. If you are passionate and driven, apply today!"}
        </p>
        {renderTags()}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
        <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
          Posted 2 days ago
        </span>
        <div className="flex items-center gap-2">
          <Link to={`/jobs/${job.id}/interview`} className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center gap-1.5 shadow-sm group-hover:shadow group-hover:border-indigo-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Mock Prep
          </Link>
          <ApplyButton job={job} />
        </div>
      </div>
    </div>
  );
}

export default JobCard;