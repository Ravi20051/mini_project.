import API from "../services/api";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function ApplyButton({ job }) {
  const jobId = job?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, applying, success, error
  const [resume, setResume] = useState(null);
  const [githubLink, setGithubLink] = useState("");
  const fileInputRef = useRef(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setStatus("idle");
    setResume(null);
    setGithubLink("");
  };

  const apply = async () => {
    setStatus("applying");
    try {
      const formData = new FormData();
      if (resume) {
        formData.append("resume", resume);
      }
      if (githubLink) {
        formData.append("githubLink", githubLink);
      }
      await API.post(`/applications/apply/${jobId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus("success");
      setTimeout(() => closeModal(), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400 && err.response.data && err.response.data.error === "Already applied for this job") {
        setStatus("success");
        setTimeout(() => closeModal(), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  const modalContent = isModalOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm transition-opacity">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={closeModal}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Job Details */}
        <div className="w-full md:w-3/5 bg-slate-50 p-6 sm:p-8 overflow-y-auto border-r border-slate-100 relative custom-scrollbar flex flex-col max-h-[85vh]">
          <button 
            onClick={closeModal}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex items-start gap-4 mb-6 pt-2 md:pt-0">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm shrink-0">
              <span className="text-2xl font-bold text-slate-400">
                {job?.companyName ? job.companyName.charAt(0).toUpperCase() : "C"}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-slate-900">{job?.title}</h2>
              <p className="text-lg text-brand-600 font-medium">{job?.companyName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {job?.location || "Remote"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {job?.jobType || "Full-time"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg shadow-sm">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {job?.salary || "Not specified"}
            </span>
          </div>

          <div className="prose prose-slate max-w-none pb-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">Job Description</h3>
            <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed mb-6">
              {job?.description || "No description provided."}
            </div>

            <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">Requirements & Skills</h3>
            <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
              {job?.requirements || "No specific requirements provided."}
            </div>
          </div>
        </div>

        {/* Right Side: Apply Form */}
        <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between relative bg-white max-h-[85vh] overflow-y-auto">
          <button 
            onClick={closeModal}
            className="hidden md:flex absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="mt-4">
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">Apply for this role</h3>
            <p className="text-sm text-slate-500 mb-8">Submit your details to get started.</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Resume (PDF)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:bg-slate-50 hover:border-brand-300 transition-colors group cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    {resume ? (
                      <span className="text-sm font-semibold text-brand-600 truncate px-2 w-full">{resume.name}</span>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-brand-600">Click to upload</span>
                        <span className="text-xs text-slate-500 mt-1">PDF max 5MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center justify-between">
                  <span>Proof of Work</span>
                  <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                </label>
                <input 
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={apply}
              disabled={!resume || status === "applying" || status === "success"}
              className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                status === "success"
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : status === "error"
                  ? "bg-red-500 text-white shadow-red-500/20"
                  : status === "applying"
                  ? "bg-brand-500 text-white opacity-80 cursor-wait"
                  : !resume 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/30 hover:-translate-y-0.5"
              }`}
            >
              {status === "success" && (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Submitted
                </>
              )}
              {status === "error" && (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Failed
                </>
              )}
              {status === "applying" && (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sending...
                </>
              )}
              {status === "idle" && "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-600 hover:text-white hover:border-brand-600 group"
      >
        <span>Apply Now</span>
        <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>

      {/* Render modal in portal to avoid stacking context issues */}
      {isModalOpen && createPortal(modalContent, document.body)}
    </>
  );
}

export default ApplyButton;