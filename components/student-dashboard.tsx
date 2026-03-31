'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_COURSES, MOCK_TOPICS, MOCK_QUIZZES } from '@/lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  Play, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Trophy
} from 'lucide-react';
import Image from 'next/image';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'quizzes'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const course = MOCK_COURSES.find(c => c.id === user?.courseId);
  const semester = course?.semesters.find(s => s.id === user?.semesterId);
  const subjects = semester?.subjects || [];

  const filteredTopics = MOCK_TOPICS.filter(t => 
    t.semesterId === user?.semesterId && 
    (!selectedSubject || t.subjectId === selectedSubject) &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredQuizzes = MOCK_QUIZZES.filter(q => 
    subjects.some(s => s.id === q.subjectId) &&
    (!selectedSubject || q.subjectId === selectedSubject)
  );

  const currentTopic = MOCK_TOPICS.find(t => t.id === selectedTopic);
  const currentQuiz = MOCK_QUIZZES.find(q => q.id === activeQuiz);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    let correct = 0;
    currentQuiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / currentQuiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-orange-500 rounded-lg"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#141414] border-r border-white/5 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">WebDataX</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'topics', icon: FileText, label: 'Course Topics' },
              { id: 'quizzes', icon: Trophy, label: 'My Quizzes' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Logged in as</p>
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-orange-500 font-mono mt-1 uppercase">{semester?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {user?.name.split(' ')[0]}!</h2>
                <p className="text-white/50">{course?.name} • {semester?.name}</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{subjects.length}</h3>
                  <p className="text-white/40 text-sm">Active Subjects</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{MOCK_TOPICS.filter(t => t.semesterId === user?.semesterId).length}</h3>
                  <p className="text-white/40 text-sm">Available Topics</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{filteredQuizzes.length}</h3>
                  <p className="text-white/40 text-sm">Pending Quizzes</p>
                </div>
              </div>

              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ChevronRight className="text-orange-500" />
                  Your Subjects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubject(sub.id);
                        setActiveTab('topics');
                      }}
                      className="group bg-[#141414] border border-white/5 hover:border-orange-500/50 p-6 rounded-3xl text-left transition-all hover:shadow-2xl hover:shadow-orange-500/5"
                    >
                      <h4 className="text-lg font-bold mb-1 group-hover:text-orange-500 transition-colors">{sub.name}</h4>
                      <p className="text-white/30 text-xs uppercase tracking-widest">Click to view topics</p>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'topics' && (
            <motion.div 
              key="topics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h2 className="text-3xl font-bold tracking-tight">Course Topics</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-2 text-sm focus:outline-none focus:border-orange-500/50 w-full md:w-64 transition-all"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button 
                      onClick={() => setSelectedSubject(null)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${!selectedSubject ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      All
                    </button>
                    {subjects.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setSelectedSubject(s.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedSubject === s.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedTopic ? (
                <div className="bg-[#141414] border border-white/10 rounded-[2rem] overflow-hidden">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="m-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                  >
                    <ChevronRight className="rotate-180" />
                    Back to Topics
                  </button>
                  
                  <div className="px-6 lg:px-12 pb-12">
                    <div className="flex items-center gap-4 mb-4">
                      <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">
                        {subjects.find(s => s.id === currentTopic?.subjectId)?.name}
                      </p>
                      {currentTopic?.section && (
                        <span className="text-sm font-mono text-white/30 bg-white/5 px-3 py-1 rounded-full">
                          Section {currentTopic.section}
                        </span>
                      )}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-8">{currentTopic?.title}</h1>
                    
                    {currentTopic?.imageUrl && (
                      <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-10 border border-white/10">
                        <Image 
                          src={currentTopic.imageUrl} 
                          alt={currentTopic.title} 
                          fill 
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      <div className="lg:col-span-2 prose prose-invert max-w-none">
                        <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Lesson Content
                        </h3>
                        <p className="text-lg text-white/70 leading-relaxed">
                          {currentTopic?.content}
                        </p>
                      </div>

                      <div className="space-y-8">
                        {currentTopic?.videoUrl && (
                          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Video Tutorial
                            </h3>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                              <iframe 
                                src={currentTopic.videoUrl}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Next Steps
                          </h3>
                          <ul className="space-y-3 text-sm text-white/60">
                            <li>• Complete the practice quiz</li>
                            <li>• Review the documentation</li>
                            <li>• Watch the video tutorial</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopics.map((topic) => (
                    <motion.button
                      key={topic.id}
                      layoutId={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="group bg-[#141414] border border-white/5 rounded-3xl overflow-hidden text-left hover:border-orange-500/30 transition-all"
                    >
                      {topic.imageUrl && (
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image 
                            src={topic.imageUrl} 
                            alt={topic.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-60" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                            {subjects.find(s => s.id === topic.subjectId)?.name}
                          </p>
                          {topic.section && (
                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                              Section {topic.section}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors">{topic.title}</h3>
                        <p className="text-white/40 text-sm line-clamp-2">{topic.content}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'quizzes' && (
            <motion.div 
              key="quizzes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-10">Available Quizzes</h2>
              
              {activeQuiz ? (
                <div className="bg-[#141414] border border-white/10 rounded-[2rem] p-8 lg:p-12">
                   {!showQuizResults && (
                     <button 
                      onClick={() => setActiveQuiz(null)}
                      className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                      <ChevronRight className="rotate-180" />
                      Cancel Quiz
                    </button>
                   )}
                  
                  {showQuizResults ? (
                    <div className="text-center py-10">
                      <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-4xl font-bold mb-2">Quiz Completed!</h2>
                      <p className="text-white/40 mb-8">Great job on finishing the assessment.</p>
                      
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10">
                        <p className="text-sm font-bold uppercase tracking-widest text-white/30 mb-2">Your Score</p>
                        <p className="text-7xl font-black text-orange-500">{calculateScore()}%</p>
                      </div>

                      <button 
                        onClick={resetQuiz}
                        className="bg-orange-500 px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all"
                      >
                        Back to Quizzes
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-12">
                        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-2">Interactive Assessment</p>
                        <h1 className="text-4xl font-bold">{currentQuiz?.title}</h1>
                      </div>

                      <div className="space-y-8">
                        {currentQuiz?.questions.map((q, idx) => (
                          <div key={q.id} className="bg-white/5 border border-white/5 p-8 rounded-3xl">
                            <p className="text-white/30 text-xs font-mono mb-4 uppercase tracking-widest">Question {idx + 1} of {currentQuiz.questions.length}</p>
                            <h3 className="text-xl font-bold mb-6">{q.question}</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {q.options.map((opt, optIdx) => (
                                <button 
                                  key={optIdx}
                                  onClick={() => handleAnswerSelect(q.id, optIdx)}
                                  className={`w-full text-left px-6 py-4 rounded-2xl border transition-all group ${
                                    quizAnswers[q.id] === optIdx 
                                      ? 'bg-orange-500 border-orange-500 text-white' 
                                      : 'bg-white/5 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                                      quizAnswers[q.id] === optIdx 
                                        ? 'bg-white text-orange-500' 
                                        : 'bg-white/10 group-hover:bg-orange-500 group-hover:text-white'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className={quizAnswers[q.id] === optIdx ? 'text-white' : 'text-white/70 group-hover:text-white'}>
                                      {opt}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => setShowQuizResults(true)}
                          disabled={Object.keys(quizAnswers).length < (currentQuiz?.questions.length || 0)}
                          className="w-full bg-orange-500 py-6 rounded-3xl font-bold text-xl shadow-2xl shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Assessment
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredQuizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => setActiveQuiz(quiz.id)}
                      className="group flex items-center justify-between bg-[#141414] border border-white/5 p-8 rounded-3xl hover:border-orange-500/50 transition-all"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">
                          {subjects.find(s => s.id === quiz.subjectId)?.name}
                        </p>
                        <h3 className="text-2xl font-bold group-hover:text-orange-500 transition-colors">{quiz.title}</h3>
                        <p className="text-white/40 text-sm mt-1">{quiz.questions.length} Questions • 15 Minutes</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
