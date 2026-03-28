import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-200 selection:text-brand-900 pt-20">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-brand-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute top-10 right-1/2 w-[30rem] h-[30rem] bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-brand-200 bg-white/80 backdrop-blur-sm text-brand-700 font-medium text-sm mb-8 hover:bg-white transition-colors cursor-pointer shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-brand-600 mr-2.5 animate-pulse"></span>
            Over 500+ New Internships Added This Week
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-slate-900 tracking-tight leading-tight mb-6">
            Launch Your Career <br className="hidden md:block"/>
            With The <span className="text-gradient">Perfect Internship</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of students connecting with top companies. Build your professional profile and land the internship that kickstarts your future.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate("/student-login")}
              className="btn-primary w-full sm:w-auto text-lg px-8 py-4"
            >
              Find Internships
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button 
              onClick={() => navigate("/company-login")}
              className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 bg-white/80 backdrop-blur-sm"
            >
              Post a Job - It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Company Logos using text */}
            {['Microsoft', 'Google', 'Amazon', 'Meta', 'Netflix'].map((company, index) => (
               <div key={index} className="text-2xl font-bold font-heading text-slate-800 tracking-tighter">
                 {company}
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tight">Everything you need to succeed</h2>
            <p className="text-lg md:text-xl text-slate-600">A comprehensive platform designed for both students seeking opportunities and companies looking for fresh talent.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             {[
               {
                 title: "Smart Matching",
                 desc: "Our algorithm matches your profile with internships that perfectly align with your skills and goals.",
                 icon: "M13 10V3L4 14h7v7l9-11h-7z"
               },
               {
                 title: "Direct Communication",
                 desc: "Connect directly with recruiters and hiring managers without middlemen getting in the way.",
                 icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
               },
               {
                 title: "Interview Prep",
                 desc: "Access a library of resources and mock interview tools to ensure you perform your best.",
                 icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
               }
             ].map((feature, idx) => (
               <div key={idx} className="card-premium p-8 text-center group bg-white z-10 relative">
                 <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-300">
                   <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                   </svg>
                 </div>
                 <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">{feature.title}</h3>
                 <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;