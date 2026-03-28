import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postJob, getJobById, updateJob } from "../services/api";

function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    requirements: "",
    jobType: "Full-time",
    status: "OPEN"
  });

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      const fetchJob = async () => {
        try {
          const res = await getJobById(id);
          if (res.data) {
            setFormData({
              title: res.data.title || "",
              description: res.data.description || "",
              location: res.data.location || "",
              salary: res.data.salary || "",
              requirements: res.data.requirements || "",
              jobType: res.data.jobType || "Full-time",
              status: res.data.status || "OPEN"
            });
          }
        } catch (err) {
          setError("Failed to fetch job details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing) {
        await updateJob(id, formData);
      } else {
        await postJob(formData);
      }
      navigate("/jobs/manage");
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "post"} job. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/jobs/manage" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Manage Jobs
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900">
              {isEditing ? "Edit Job" : "Post a New Job"}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEditing ? "Update the details of your job listing." : "Fill out the details to publish a new job opportunity."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="card-premium p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer Intern"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote, San Francisco"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="input-field bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Salary / Stipend</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $5000/mo or Unpaid"
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Job Description</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the role and responsibilities..."
                  className="input-field resize-none"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Requirements & Qualifications</label>
                <textarea
                  name="requirements"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List skills, experience, or degrees needed..."
                  className="input-field resize-none"
                ></textarea>
              </div>

              {isEditing && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Job Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field bg-white"
                  >
                    <option value="OPEN">Open (Accepting Applications)</option>
                    <option value="CLOSED">Closed (Not Accepting)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Link to="/jobs/manage" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Post Job"}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}

export default PostJob;
