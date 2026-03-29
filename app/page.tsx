'use client';

import { useState } from 'react';

export default function Home() {
  const [threads, setThreads] = useState<any[]>([
    {
      id: 1,
      name: "AI & Machine Learning Updates",
      tags: ["AI", "Tech", "India"],
      lastUpdated: "2 min ago",
      description: "Latest breakthroughs, tutorials & Indian AI news",
      interest: "AI",
      profileAnswers: { 0: "Daily news & quick updates", 1: "Practical tutorials" } // saved MCQ answers
    },
    {
      id: 2,
      name: "IPL Cricket Daily",
      tags: ["Cricket", "Sports"],
      lastUpdated: "1 hour ago",
      description: "Match highlights, player news & fantasy tips",
      interest: "Cricket",
      profileAnswers: {}
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Feed states
  const [currentView, setCurrentView] = useState<'dashboard' | 'feed'>('dashboard');
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [feedInsight, setFeedInsight] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);

  const popularInterests = ["Tech", "Sports", "Health", "Finance", "Politics", "Entertainment", "Cricket", "AI", "Startup"];

  const fetchMCQs = async () => {
    if (!selectedInterest) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest: selectedInterest }),
      });
      const data = await res.json();
      setMcqs(data.questions || []);
    } catch (err) {
      alert("Could not generate questions. Check Grok API key.");
    }
    setLoading(false);
  };

  const handleCreateThread = () => {
    const newThread = {
      id: Date.now(),
      name: `${selectedInterest} Updates`,
      tags: [selectedInterest, "AI-Curated"],
      lastUpdated: "Just now",
      description: `Your personalized ${selectedInterest} feed`,
      interest: selectedInterest,
      profileAnswers: { ...answers }
    };
    setThreads([...threads, newThread]);
    setShowModal(false);
    setStep(1);
    setSelectedInterest("");
    setMcqs([]);
    setAnswers({});
  };

  const openFeed = async (thread: any) => {
    setSelectedThread(thread);
    setCurrentView('feed');
    setFeedLoading(true);
    try {
      const res = await fetch(`/api/fetch-feed?interest=${encodeURIComponent(thread.interest)}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setFeedInsight(data.insight || "");
    } catch (err) {
      alert("Could not load feed. Check NewsData.io API key.");
    }
    setFeedLoading(false);
  };

  const refreshFeed = () => openFeed(selectedThread);

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedThread(null);
    setArticles([]);
    setFeedInsight("");
  };

  const editThreadProfile = () => {
    // Pre-fill modal with current thread data
    setSelectedInterest(selectedThread.interest);
    setAnswers(selectedThread.profileAnswers || {});
    setShowModal(true);
    setStep(2);
    fetchMCQs(); // re-generate fresh questions
  };

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="flex h-screen bg-zinc-950 text-white">
        {/* Sidebar same as before */}
        <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-2xl font-bold tracking-tight">My Threads</h1>
            <p className="text-zinc-400 text-sm mt-1">AI Personalized News</p>
          </div>

          <div className="p-4">
            <button onClick={() => { setShowModal(true); setStep(1); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95">
              <span className="text-xl">+</span>
              <span className="text-lg">Create New Thread</span>
            </button>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-800 text-white">
              <span className="text-xl">🏠</span>
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800">
              <span className="text-xl">📌</span>
              <span className="font-medium">My Threads</span>
            </a>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="font-medium">Shree Balaji</p>
                <p className="text-xs text-zinc-500">Kanpur, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-semibold tracking-tight">My Threads</h2>
              <input type="text" placeholder="Search threads..." className="bg-zinc-900 border border-zinc-700 rounded-3xl px-6 py-3 w-80 focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {threads.map((thread) => (
                <div key={thread.id} className="bg-zinc-900 border border-zinc-700 hover:border-zinc-400 rounded-3xl p-6 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{thread.name}</h3>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-2xl">{thread.lastUpdated}</span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-3">{thread.description}</p>
                  <div className="flex gap-2 mt-6">
                    {thread.tags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-zinc-800 px-4 py-2 rounded-3xl text-zinc-300">{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => openFeed(thread)} className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-sm font-medium transition-all">
                    Open Feed →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal - same as before but with better UI */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 w-full max-w-2xl mx-4 rounded-3xl p-8 max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {step === 1 ? "Create New Thread - Step 1 of 2" : "Refine Your Interest - Step 2 of 2"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-3xl text-zinc-400 hover:text-white">×</button>
              </div>

              {step === 1 && (
                <>
                  <input type="text" placeholder="Search or type interest..." className="w-full bg-zinc-800 border border-zinc-700 rounded-3xl px-6 py-4 text-lg mb-6" value={selectedInterest} onChange={(e) => setSelectedInterest(e.target.value)} />
                  <p className="text-zinc-400 mb-4">Popular Interests</p>
                  <div className="flex flex-wrap gap-3">
                    {popularInterests.map((interest) => (
                      <button key={interest} onClick={() => setSelectedInterest(interest)} className={`px-6 py-3 rounded-3xl border text-lg transition-all ${selectedInterest === interest ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-700 hover:border-zinc-400"}`}>
                        {interest}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setStep(2); fetchMCQs(); }} disabled={!selectedInterest || loading} className="mt-10 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 py-5 rounded-2xl text-xl font-medium">
                    {loading ? "Generating AI Questions..." : "Next →"}
                  </button>
                </>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  {mcqs.map((q: any, index: number) => (
                    <div key={index} className="bg-zinc-800 p-6 rounded-3xl">
                      <p className="font-medium mb-4">{q.question}</p>
                      <div className="space-y-3">
                        {q.options.map((option: string, i: number) => (
                          <label key={i} className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name={`q${index}`} className="accent-blue-600" checked={answers[index] === option} onChange={() => setAnswers({ ...answers, [index]: option })} />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleCreateThread} className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl text-xl font-medium">
                    Finish &amp; Create Thread
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Feed View (with new features)
  return (
    <div className="flex h-screen bg-zinc-950 text-white flex-col">
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={backToDashboard} className="text-3xl hover:text-blue-400">←</button>
          <div>
            <h1 className="text-3xl font-semibold">{selectedThread?.name}</h1>
            <p className="text-zinc-400 text-sm">AI-curated • Last refreshed just now</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={editThreadProfile} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-medium">✏️ Edit Profile</button>
          <button onClick={refreshFeed} disabled={feedLoading} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-medium flex items-center gap-2">
            {feedLoading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Personalized Grok Insight */}
          {feedInsight && (
            <div className="mb-8 bg-blue-950 border border-blue-800 rounded-3xl p-6 text-center">
              <span className="text-blue-400 text-sm font-medium">✦ AI INSIGHT</span>
              <p className="text-lg mt-2 text-blue-100">{feedInsight}</p>
            </div>
          )}

          {/* Your Preferences */}
          {selectedThread?.profileAnswers && Object.keys(selectedThread.profileAnswers).length > 0 && (
            <div className="mb-8 bg-zinc-900 rounded-3xl p-6">
              <h4 className="text-zinc-400 text-sm mb-3">Your saved preferences</h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(selectedThread.profileAnswers).map(([q, ans]: any) => (
                  <div key={q} className="bg-zinc-800 px-5 py-2 rounded-3xl text-sm">
                    {ans}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedLoading ? (
            <p className="text-center text-xl text-zinc-400">Loading latest updates...</p>
          ) : (
            <div className="space-y-8">
              {articles.map((article: any, index: number) => (
                <div key={index} className="flex gap-6 bg-zinc-900 border border-zinc-700 rounded-3xl p-6 hover:border-zinc-400 transition-all">
                  {article.image && <img src={article.image} alt="" className="w-40 h-28 object-cover rounded-2xl" />}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{article.source}</span>
                      <span>{article.pubDate}</span>
                    </div>
                    <a href={article.link} target="_blank" className="block hover:text-blue-400">
                      <h3 className="text-2xl font-semibold mt-2 leading-tight">{article.title}</h3>
                    </a>
                    <p className="text-zinc-400 mt-4 line-clamp-3">{article.description}</p>
                    <a href={article.link} target="_blank" className="inline-block mt-6 text-blue-400 text-sm font-medium">Read full article →</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}