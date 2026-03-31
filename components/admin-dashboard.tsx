'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS, MOCK_COURSES, MOCK_TOPICS, MOCK_QUIZZES } from '@/lib/data';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from './confirmation-modal';
import { 
  Users, 
  BookOpen, 
  Plus, 
  LogOut, 
  Settings, 
  BarChart3,
  Search,
  MoreVertical,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeView, setActiveView] = useState<'overview' | 'students' | 'content' | 'courses'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', courseId: '', semesterId: '' });
  const [allUsers, setAllUsers] = useState(MOCK_USERS);
  const [allTopics, setAllTopics] = useState(MOCK_TOPICS);
  const [allQuizzes, setAllQuizzes] = useState(MOCK_QUIZZES);
  const [allCourses, setAllCourses] = useState(MOCK_COURSES);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<{id?: string, name: string, instructorId?: string}>({ name: '' });
  const [editingSemester, setEditingSemester] = useState<{id?: string, name: string}>({ name: '' });
  const [editingSubject, setEditingSubject] = useState<{id?: string, name: string}>({ name: '' });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentToAdd = {
      id: `u${allUsers.length + 1}`,
      ...newStudent,
      role: 'student' as const
    };
    setAllUsers([...allUsers, studentToAdd]);
    setIsAddStudentModalOpen(false);
    setNewStudent({ name: '', email: '', courseId: '', semesterId: '' });
  };

  const handleDeleteStudent = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      onConfirm: () => {
        setAllUsers(allUsers.filter(u => u.id !== id));
      }
    });
  };

  const handleDeleteTopic = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Topic',
      message: 'Are you sure you want to delete this topic? This action cannot be undone.',
      onConfirm: () => {
        setAllTopics(allTopics.filter(t => t.id !== id));
      }
    });
  };

  const handleDeleteQuiz = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      onConfirm: () => {
        setAllQuizzes(allQuizzes.filter(q => q.id !== id));
      }
    });
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse.id) {
      setAllCourses(allCourses.map(c => c.id === editingCourse.id ? { ...c, name: editingCourse.name } : c));
    } else {
      const newCourse = {
        id: `c${allCourses.length + 1}`,
        name: editingCourse.name,
        instructorId: user?.id,
        semesters: []
      };
      setAllCourses([...allCourses, newCourse]);
    }
    setIsCourseModalOpen(false);
    setEditingCourse({ name: '' });
  };

  const handleDeleteCourse = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This will also remove all associated semesters and subjects. This action cannot be undone.',
      onConfirm: () => {
        setAllCourses(allCourses.filter(c => c.id !== id));
      }
    });
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    setAllCourses(allCourses.map(course => {
      if (course.id !== selectedCourseId) return course;
      
      if (editingSemester.id) {
        return {
          ...course,
          semesters: course.semesters.map(s => s.id === editingSemester.id ? { ...s, name: editingSemester.name } : s)
        };
      } else {
        const newSemester = {
          id: `s${course.semesters.length + 1}`,
          name: editingSemester.name,
          subjects: []
        };
        return {
          ...course,
          semesters: [...course.semesters, newSemester]
        };
      }
    }));
    
    setIsSemesterModalOpen(false);
    setEditingSemester({ name: '' });
  };

  const handleDeleteSemester = (courseId: string, semId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Semester',
      message: 'Are you sure you want to delete this semester? This will also remove all associated subjects. This action cannot be undone.',
      onConfirm: () => {
        setAllCourses(allCourses.map(c => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            semesters: c.semesters.filter(s => s.id !== semId)
          };
        }));
      }
    });
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSemesterId) return;
    
    setAllCourses(allCourses.map(course => {
      if (course.id !== selectedCourseId) return course;
      
      return {
        ...course,
        semesters: course.semesters.map(sem => {
          if (sem.id !== selectedSemesterId) return sem;
          
          if (editingSubject.id) {
            return {
              ...sem,
              subjects: sem.subjects.map(sub => sub.id === editingSubject.id ? { ...sub, name: editingSubject.name } : sub)
            };
          } else {
            const newSubject = {
              id: `sub${sem.subjects.length + 1}`,
              name: editingSubject.name
            };
            return {
              ...sem,
              subjects: [...sem.subjects, newSubject]
            };
          }
        })
      };
    }));
    
    setIsSubjectModalOpen(false);
    setEditingSubject({ name: '' });
  };

  const handleDeleteSubject = (courseId: string, semId: string, subId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Subject',
      message: 'Are you sure you want to delete this subject? This action cannot be undone.',
      onConfirm: () => {
        setAllCourses(allCourses.map(c => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            semesters: c.semesters.map(s => {
              if (s.id !== semId) return s;
              return {
                ...s,
                subjects: s.subjects.filter(sub => sub.id !== subId)
              };
            })
          };
        }));
      }
    });
  };

  if (!mounted) return null;

  const students = allUsers.filter(u => u.role === 'student');
  const courses = allCourses.filter(c => user?.assignedCourses?.includes(c.id));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141414] border-r border-white/5 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">WebDataX</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'students', icon: Users, label: 'Manage Students' },
              { id: 'content', icon: BookOpen, label: 'Course Content' },
              { id: 'courses', icon: BookOpen, label: 'Manage Courses' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
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
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
            <p className="text-white/40">Managing {courses.length} Courses</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Total Students</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{students.length}</span>
                    <span className="text-green-500 text-xs font-bold mb-1">+12%</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Active Quizzes</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">24</span>
                    <span className="text-blue-500 text-xs font-bold mb-1">Live</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Avg. Score</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">78%</span>
                    <span className="text-white/20 text-xs font-bold mb-1">Overall</span>
                  </div>
                </div>
              </div>

              <section className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold">Recent Student Activity</h3>
                  <button onClick={() => setActiveView('students')} className="text-xs text-blue-500 font-bold uppercase tracking-wider">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-white/30">
                        <th className="px-6 py-4 font-semibold">Student Name</th>
                        <th className="px-6 py-4 font-semibold">Course</th>
                        <th className="px-6 py-4 font-semibold">Last Active</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.slice(0, 5).map((student) => (
                        <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/50">
                            {MOCK_COURSES.find(c => c.id === student.courseId)?.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-white/50 font-mono">2h ago</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">Active</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-white/20 hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}

          {activeView === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-xl">All Students</h3>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Student
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.filter(s => 
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(s => (
                    <div key={s.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-lg">
                          {s.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold">{s.name}</h4>
                          <p className="text-xs text-white/40">{s.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Course</span>
                          <span className="text-white/60">{MOCK_COURSES.find(c => c.id === s.courseId)?.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Semester</span>
                          <span className="text-white/60">{s.semesterId}</span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all">Edit</button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Course Topics</h3>
                  <div className="space-y-4">
                    {allTopics.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{t.title}</h4>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{t.subjectId}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-white/20 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTopic(t.id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-sm font-bold text-white/30 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Topic
                    </button>
                  </div>
                </div>

                <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-2xl font-bold mb-6">Quizzes</h3>
                  <div className="space-y-4">
                    {allQuizzes.map(q => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{q.title}</h4>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{q.questions.length} Questions</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-white/20 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-sm font-bold text-white/30 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Quiz
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Course Management</h3>
                <button 
                  onClick={() => {
                    setEditingCourse({ name: '' });
                    setIsCourseModalOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="bg-[#141414] border border-white/5 rounded-3xl p-8 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{course.name}</h3>
                          <p className="text-white/40 text-sm">
                            Instructor: {user?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCourse({ id: course.id, name: course.name });
                            setIsCourseModalOpen(true);
                          }}
                          className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white/30">Semesters</h4>
                        <button 
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setEditingSemester({ name: '' });
                            setIsSemesterModalOpen(true);
                          }}
                          className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Semester
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.semesters.map(semester => (
                          <div key={semester.id} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-bold">{semester.name}</h5>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    setEditingSemester({ id: semester.id, name: semester.name });
                                    setIsSemesterModalOpen(true);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded text-white/20 hover:text-white transition-all"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSemester(course.id, semester.id)}
                                  className="p-1 hover:bg-red-500/10 rounded text-white/20 hover:text-red-500 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Subjects</span>
                                <button 
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    setSelectedSemesterId(semester.id);
                                    setEditingSubject({ name: '' });
                                    setIsSubjectModalOpen(true);
                                  }}
                                  className="text-[10px] font-bold text-blue-500/60 hover:text-blue-500 transition-all"
                                >
                                  + Add Subject
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {semester.subjects.map(subject => (
                                  <div key={subject.id} className="group flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
                                    <span>{subject.name}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <button 
                                        onClick={() => {
                                          setSelectedCourseId(course.id);
                                          setSelectedSemesterId(semester.id);
                                          setEditingSubject({ id: subject.id, name: subject.name });
                                          setIsSubjectModalOpen(true);
                                        }}
                                        className="hover:text-blue-500"
                                      >
                                        <Settings className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSubject(course.id, semester.id, subject.id)}
                                        className="hover:text-red-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStudentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">Add New Student</h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Course</label>
                    <select 
                      required
                      value={newStudent.courseId}
                      onChange={(e) => setNewStudent({...newStudent, courseId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="" className="bg-[#141414]">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#141414]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Semester</label>
                    <select 
                      required
                      value={newStudent.semesterId}
                      onChange={(e) => setNewStudent({...newStudent, semesterId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="" className="bg-[#141414]">Select Sem</option>
                      <option value="sem-1" className="bg-[#141414]">Semester 1</option>
                      <option value="sem-2" className="bg-[#141414]">Semester 2</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingCourse.id ? 'Edit Course' : 'Add Course'}</h3>
              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Course Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Diploma in Information Technology"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Semester Modal */}
      <AnimatePresence>
        {isSemesterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSemesterModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingSemester.id ? 'Edit Semester' : 'Add Semester'}</h3>
              <form onSubmit={handleSaveSemester} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Semester Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingSemester.name}
                    onChange={(e) => setEditingSemester({...editingSemester, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Semester 1"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsSemesterModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Save Semester
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubjectModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingSubject.id ? 'Edit Subject' : 'Add Subject'}</h3>
              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Subject Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Save Subject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
