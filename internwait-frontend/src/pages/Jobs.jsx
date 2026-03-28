import { useEffect, useState } from "react";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Any Location");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedType) params.type = selectedType;
      if (selectedLocation && selectedLocation !== "Any Location") params.location = selectedLocation;
      
      const res = await getJobs(params);
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedType, selectedLocation]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 selection:bg-brand-200 selection:text-brand-900">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-8 mb-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Explore Opportunities</h1>
              <p className="text-slate-500">Find and apply to the best internships available right now.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search jobs, companies, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 shrink-0">
            <div className="card-premium p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold font-heading text-slate-900">Filters</h3>
                <button onClick={() => { setSearchQuery(""); setSelectedType(""); setSelectedLocation("Any Location"); }} className="text-sm text-brand-600 font-medium hover:text-brand-500">Clear all</button>
              </div>

              <div className="space-y-6">
                {/* Filter Section 1 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {["Full-time", "Part-time", "Remote", "Hybrid"].map(type => (
                      <label key={type} className="flex items-center group cursor-pointer">
                        <input 
                          type="radio" 
                          name="jobType"
                          value={type}
                          checked={selectedType === type}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-4 h-4 rounded-full border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors" 
                        />
                        <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-900">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter Section 2 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Location</h4>
                  <select 
                    className="input-field py-2 text-sm text-slate-600"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option>Any Location</option>
                    <option>San Francisco, CA</option>
                    <option>New York, NY</option>
                    <option>Remote (US)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="w-full lg:w-3/4">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-brand-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-500 font-medium text-lg">Loading opportunities...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="card-premium p-12 text-center border-dashed border-2 border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">No jobs available</h3>
                <p className="text-slate-500">Check back later or adjust your filters to find new opportunities.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                  <span>Showing <span className="font-bold text-slate-900">{jobs.length}</span> results</span>
                  <div className="flex items-center gap-2">
                    <span>Sort by:</span>
                    <select className="border-none bg-transparent font-medium text-slate-900 focus:ring-0 cursor-pointer p-0">
                      <option>Most relevant</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}

export default Jobs;