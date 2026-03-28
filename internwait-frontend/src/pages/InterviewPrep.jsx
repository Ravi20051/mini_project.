import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { chatInterview, getJobById, concludeInterview } from "../services/api";

function InterviewPrep() {
  const { id } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewResult, setInterviewResult] = useState(null);
  const [isConcluding, setIsConcluding] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const initInterview = async () => {
      try {
        setIsLoading(true);
        // Fetch job details for the header
        const jobRes = await getJobById(id);
        setJobTitle(jobRes.data.title);

        // Start the interview with an initial hidden user prompt
        const initialMessage = { role: "user", content: "Hello, I am ready to start the interview." };
        
        const res = await chatInterview(id, [initialMessage]);
        
        // Only show the AI's response in the UI, not the hidden trigger
        setMessages([
          { role: "model", content: res.data.response }
        ]);
        
      } catch (err) {
        console.error(err);
        setError("Failed to start the interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    initInterview();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: "user", content: inputValue.trim() };
    
    // We need to send the full history to the backend.
    // However, the backend expects the FIRST user message to be the trigger, so we must prepend it to the history we send, 
    // even though we don't display it to the user.
    const hiddenInitialMessage = { role: "user", content: "Hello, I am ready to start the interview." };
    const historyToSend = [hiddenInitialMessage, ...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await chatInterview(id, historyToSend);
      setMessages(prev => [...prev, { role: "model", content: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try answering again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConclude = async () => {
    setIsConcluding(true);
    try {
      // Send history just like chatInterview, prepended with hidden prompt
      const hiddenInitialMessage = { role: "user", content: "Hello, I am ready to start the interview." };
      const historyToSend = [hiddenInitialMessage, ...messages];
      const res = await concludeInterview(id, historyToSend);
      setInterviewResult(res.data);
    } catch (err) {
      console.error("Failed to conclude interview", err);
      alert("Failed to conclude interview and get score. Please try again.");
    } finally {
      setIsConcluding(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-rose-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link to="/jobs" className="btn-primary block w-full py-3 text-center">Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-4 px-6 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/jobs" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Interview</span>
              </div>
              <h1 className="text-xl font-bold font-heading text-slate-900">{jobTitle || "Loading Job..."}</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
             <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span className="text-sm font-bold text-indigo-700">Gemini AI</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          
          {messages.length === 0 && isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
                 <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-5 text-white shadow-xl">
                   <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                   </svg>
                 </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connecting to Interviewer...</h3>
              <p className="text-slate-500 text-sm">Gemini is reviewing the job description and preparing your first question.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === "model" 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
                  : "bg-slate-200 text-slate-600 font-bold"
              }`}>
                {msg.role === "model" ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                ) : (
                  "You"
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <span className="text-xs font-semibold text-slate-400 mb-1 px-1">
                  {msg.role === "model" ? "Interviewer (Gemini)" : "You"}
                </span>
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === "model" 
                    ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" 
                    : "bg-brand-600 text-white rounded-tr-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {messages.length > 0 && isLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <div className="flex flex-col items-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center h-[52px]">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area or Results */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] relative z-20">
        <div className="max-w-4xl mx-auto">
          {interviewResult ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Interview Concluded!</h3>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow flex-col mb-4 border-4 border-indigo-100">
                  <span className="text-3xl font-black text-indigo-600 leading-none">{interviewResult.score}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                </div>
                <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur rounded-xl p-4 border border-white shadow-sm text-left">
                  <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    AI Feedback
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed italic">{interviewResult.feedback}</p>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <Link to={`/jobs`} className="px-6 py-2.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    Back to Jobs
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    e.target.style.height = "inherit";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={isLoading ? "Please wait..." : "Type your answer here... (Press Enter to send)"}
                  disabled={isLoading || isConcluding}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-5 pr-14 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ minHeight: "52px", maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || isConcluding}
                  className="absolute right-2 bottom-2 p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors shadow-sm flex items-center justify-center shrink-0 w-10 h-10"
                >
                  <svg className="w-5 h-5 -ml-0.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Gemini can make mistakes. Consider verifying important information.</p>
                {messages.length > 2 && (
                  <button 
                    onClick={handleConclude}
                    disabled={isLoading || isConcluding}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConcluding ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    Conclude & Get Score
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default InterviewPrep;
