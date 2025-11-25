'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, type Task } from '@/lib/api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: (data) => {
      setTaskId(data.id);
      setUrl('');
      setQuestion('');
    },
  });

  // Poll for task status
  const { data: task, isLoading: isPolling } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.getTask(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const task = query.state.data as Task | undefined;
      // Stop polling if task is completed or failed
      if (task?.status === 'completed' || task?.status === 'failed') {
        return false;
      }
      // Poll every 2 seconds
      return 2000;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !question) return;

    createTaskMutation.mutate({ url, question });
  };

  const handleReset = () => {
    setTaskId(null);
    setUrl('');
    setQuestion('');
  };

  return (
    <>
    <main className="min-h-screen relative z-10 flex flex-col items-center p-6">
      {/* Header - Fixed at Top */}
      <div className="w-full max-w-4xl pt-12 text-center fade-in z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00f3ff] bg-[#00f3ff]/10 mb-8">
          <span className="w-2 h-2 bg-[#00f3ff] animate-pulse"></span>
          <span className="text-[10px] font-mono text-[#00f3ff] tracking-widest">NETRUNNER ONLINE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white glitch-text">
          AI_WEBSITE_ANALYSIS
        </h1>
        <p className="text-[#00f3ff] font-mono text-[10px] tracking-[0.3em] uppercase mb-6">
          v2.0.0 :: PLAYWRIGHT :: GROQ :: BULLMQ
        </p>
        
        {/* Social Link - Header */}
        <div className="flex justify-center">
          <a 
            href="https://www.linkedin.com/in/mayankvashishtt/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 rounded-full bg-black/60 border-2 border-[#00f3ff] text-[#00f3ff] hover:text-[#ff00ff] hover:border-[#ff00ff] transition-all duration-300 hover:scale-125 shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] group"
            aria-label="LinkedIn Profile"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Main Interface - Centered Vertically */}
      <div className="flex-1 flex items-center justify-center w-full pb-20">
        <div className="w-full max-w-md">
          {!taskId ? (
            <div className="pro-card p-8 fade-in">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="cmd-input-group">
                <label htmlFor="url" className="cmd-label">
                  TARGET_URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="cmd-input"
                  required
                  disabled={createTaskMutation.isPending}
                  autoComplete="off"
                />
              </div>

              <div className="cmd-input-group">
                <label htmlFor="question" className="cmd-label">
                  QUERY_PARAM
                </label>
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Extract main value proposition..."
                  className="cmd-input"
                  required
                  disabled={createTaskMutation.isPending}
                  autoComplete="off"
                />
              </div>

                {createTaskMutation.isError && (
                  <div className="terminal-window border-red-900/50 text-red-500 mb-4">
                    <div className="log-entry">
                      <span className="log-prefix">!</span>
                      <span>ERROR: {createTaskMutation.error instanceof Error ? createTaskMutation.error.message : 'Initialization failed'}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-pro"
                  disabled={createTaskMutation.isPending || !url || !question}
                >
                  {createTaskMutation.isPending ? 'INITIALIZING_SEQUENCE...' : 'EXECUTE_ANALYSIS'}
                </button>
              </form>
            </div>
          ) : (
            /* Task Status View - Terminal Style */
            <div className="space-y-6 fade-in">
              <div className="terminal-window min-h-[300px]">
                <div className="border-b border-[#333] pb-2 mb-4 flex items-center justify-between">
                  <span className="text-xs text-[#555]">ID: {taskId}</span>
                  <span className={`text-xs ${task?.status === 'completed' ? 'text-[#0aff00]' : task?.status === 'failed' ? 'text-[#ff0000]' : 'text-[#00f3ff]'}`}>
                    STATUS: {task?.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                
                <div className="space-y-2 font-mono text-sm">
                  <div className="log-entry">
                    <span className="log-prefix">{'>'}</span>
                    <span>TARGET: <span className="text-[#00f3ff]">{task?.url}</span></span>
                  </div>
                  <div className="log-entry">
                    <span className="log-prefix">{'>'}</span>
                    <span>QUERY: <span className="text-[#e0e0e0]">{task?.question}</span></span>
                  </div>
                  
                  {task?.status === 'processing' && (
                    <>
                      <div className="log-entry">
                        <span className="log-prefix text-[#0aff00]">✓</span>
                        <span>Job queued successfully</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-prefix text-[#00f3ff]">ℹ</span>
                        <span>Initializing Playwright browser...</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-prefix text-[#00f3ff]">ℹ</span>
                        <span>Scraping DOM content...</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-prefix text-[#00f3ff]">ℹ</span>
                        <span>Processing with Groq AI...</span>
                      </div>
                      <div className="log-entry mt-4">
                        <span className="cursor"></span>
                      </div>
                    </>
                  )}

                  {task?.status === 'completed' && (
                    <>
                      <div className="log-entry">
                        <span className="log-prefix text-[#0aff00]">✓</span>
                        <span>Analysis complete</span>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#333]">
                        <div className="text-[#555] mb-2">// OUTPUT_STREAM</div>
                        <div className="text-[#e0e0e0] whitespace-pre-wrap leading-relaxed">
                          {task.answer}
                        </div>
                      </div>
                    </>
                  )}

                  {task?.status === 'failed' && (
                    <div className="log-entry text-[#ff0000] mt-4">
                      <span className="log-prefix">!</span>
                      <span>FATAL ERROR: {task.error}</span>
                    </div>
                  )}
                </div>
              </div>

              {(task?.status === 'completed' || task?.status === 'failed') && (
                <button onClick={handleReset} className="btn-pro">
                  NEW_SESSION
                </button>
              )}
            </div>
          )}
      </div>
      </div>

    </main>
    </>
  );
}
