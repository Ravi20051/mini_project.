import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import CompanyLogin from "./pages/CompanyLogin";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import ManageJobs from "./pages/ManageJobs";
import PostJob from "./pages/PostJob";
import Applications from "./pages/Applications";
import JobApplicants from "./pages/JobApplicants";
import Profile from "./pages/Profile";
import InterviewPrep from "./pages/InterviewPrep";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

import Navbar from "./components/Navbar";

function App() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/student-login" element={<StudentLogin />} />

        <Route path="/company-login" element={<CompanyLogin />} />
        
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/register" element={<Register />} />
        
        <Route path="/jobs/manage" element={<ManageJobs />} />
        <Route path="/jobs/post" element={<PostJob />} />
        <Route path="/jobs/edit/:id" element={<PostJob />} />
        <Route path="/jobs/:id/applicants" element={<JobApplicants />} />

        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id/interview" element={<InterviewPrep />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </BrowserRouter>

  );
}

export default App;