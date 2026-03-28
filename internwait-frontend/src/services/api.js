import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
});

/* attach JWT token automatically */
API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if(token){
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;

});

/* ---------- AUTH ---------- */

export const registerUser = (data, role) =>
  API.post(`/auth/${role.toLowerCase()}/register`, data);

export const loginUser = (data, role) =>
  API.post(`/auth/${role.toLowerCase()}/login`, data);

/* ---------- JOBS ---------- */

export const getJobs = (params) =>
  API.get("/jobs", { params });

export const getJobById = (id) =>
  API.get(`/jobs/${id}`);

export const getCompanyJobs = () =>
  API.get("/jobs/company");

export const postJob = (data) =>
  API.post("/jobs/post", data);

export const updateJob = (id, data) =>
  API.put(`/jobs/${id}`, data);

export const deleteJob = (id) =>
  API.delete(`/jobs/${id}`);

/* ---------- APPLICATIONS ---------- */

export const applyJob = (jobId) =>
  API.post(`/applications/apply/${jobId}`);

export const getStudentApplications = () =>
  API.get("/applications/student");

export const getJobApplications = (jobId) =>
  API.get(`/company/applications/${jobId}`);

export const exportJobApplicationsCSV = (jobId) =>
  API.get(`/company/applications/${jobId}/export`, { responseType: 'blob' });

export const updateApplicationStatus = (applicationId, status, rejectionReason = null) => {
    const payload = { status };
    if (rejectionReason) payload.reason = rejectionReason;
    return API.put(`/company/application/${applicationId}/status`, payload);
};

// Profile Endpoints
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile", data);

// Interview Endpoints
export const generateInterviewQuestions = (jobId) => API.get(`/ai/interview/generate/${jobId}`);
export const evaluateInterviewAnswers = (payload) => API.post(`/ai/interview/evaluate`, payload);
export const chatInterview = (jobId, history) => API.post(`/ai/interview/chat/${jobId}`, history);
export const concludeInterview = (jobId, history) => API.post(`/ai/interview/chat/${jobId}/conclude`, history);
export const getStudentAIRecommendations = () => API.get("/dashboard/recommendations");


/* ---------- DASHBOARD ---------- */

export const getDashboard = () =>
  API.get("/dashboard");

export default API;