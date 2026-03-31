'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS, MOCK_COURSES, MOCK_TOPICS } from '@/lib/data';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from './confirmation-modal';
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Plus,
  Server,
  Activity,
  Database,
  Globe,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeSection, setActiveSection] = useState<'system' | 'admins' | 'students' | 'courses'>('system');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState(MOCK_USERS);
  const [allCourses, setAllCourses] = useState(MOCK_COURSES);
  const [allTopics, setAllTopics] = useState(MOCK_TOPICS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  
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
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const [editingCourse, setEditingCourse] = useState<{id?: string, name: string, description?: string, instructorId?: string}>({ name: '' });
  const [renamingCourseId, setRenamingCourseId] = useState<string | null>(null);
  const [tempCourseName, setTempCourseName] = useState('');
  const [editingSemester, setEditingSemester] = useState<{id?: string, name: string, instructorId?: string}>({ name: '' });
  const [editingSubject, setEditingSubject] = useState<{id?: string, name: string, instructorId?: string}>({ name: '' });
  const [editingTopic, setEditingTopic] = useState<{id?: string, title: string, content: string, imageUrl: string, videoUrl: string, section: string}>({ title: '', content: '', imageUrl: '', videoUrl: '', section: '' });

  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'student',
    courseId: 'dit-1y',
    semesterId: 'sem-1'
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.id) {
      // Edit existing user
      setAllUsers(allUsers.map(u => u.id === userForm.id ? { ...u, ...userForm } : u));
    } else {
      // Create new user
      const userToAdd = {
        ...userForm,
        id: `u${allUsers.length + 1}`,
      };
      setAllUsers([...allUsers, userToAdd as any]);
    }
    setIsUserModalOpen(false);
    setUserForm({
      id: '',
      name: '',
      email: '',
      password: '',
      role: 'admin',
      courseId: 'dit-1y',
      semesterId: 'sem-1'
    });
  };

  const handleRenameCourse = (courseId: string) => {
    if (!tempCourseName.trim()) return;
    setAllCourses(allCourses.map(c => c.id === courseId ? { ...c, name: tempCourseName } : c));
    setRenamingCourseId(null);
    setTempCourseName('');
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    let courseId = editingCourse.id;
    const instructorId = editingCourse.instructorId;

    if (courseId) {
      setAllCourses(allCourses.map(c => c.id === courseId ? { ...c, name: editingCourse.name, description: editingCourse.description, instructorId } : c));
    } else {
      courseId = `c${allCourses.length + 1}`;
      const newCourse = {
        id: courseId,
        name: editingCourse.name,
        description: editingCourse.description,
        instructorId,
        semesters: []
      };
      setAllCourses([...allCourses, newCourse]);
    }

    // Sync users state
    setAllUsers(allUsers.map(u => {
      if (u.role !== 'admin') return u;
      
      const isCurrentlyAssigned = u.assignedCourses?.includes(courseId!);
      const shouldBeAssigned = u.id === instructorId;

      if (shouldBeAssigned && !isCurrentlyAssigned) {
        return { ...u, assignedCourses: [...(u.assignedCourses || []), courseId!] };
      } else if (!shouldBeAssigned && isCurrentlyAssigned) {
        return { ...u, assignedCourses: (u.assignedCourses || []).filter(id => id !== courseId) };
      }
      return u;
    }));

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
        // Remove course from all admins
        setAllUsers(allUsers.map(u => {
          if (u.role !== 'admin') return u;
          return { ...u, assignedCourses: (u.assignedCourses || []).filter(cid => cid !== id) };
        }));
      }
    });
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    let semesterId = editingSemester.id;
    const instructorId = editingSemester.instructorId;

    setAllCourses(allCourses.map(course => {
      if (course.id !== selectedCourseId) return course;
      
      if (semesterId) {
        return {
          ...course,
          semesters: course.semesters.map(s => s.id === semesterId ? { ...s, name: editingSemester.name, instructorId } : s)
        };
      } else {
        semesterId = `s${course.semesters.length + 1}`;
        const newSemester = {
          id: semesterId,
          name: editingSemester.name,
          subjects: [],
          instructorId
        };
        return {
          ...course,
          semesters: [...course.semesters, newSemester]
        };
      }
    }));

    // Sync users state for assignedSemesters
    setAllUsers(allUsers.map(u => {
      if (u.role !== 'admin') return u;
      
      const isCurrentlyAssigned = u.assignedSemesters?.includes(semesterId!);
      const shouldBeAssigned = u.id === instructorId;

      if (shouldBeAssigned && !isCurrentlyAssigned) {
        return { ...u, assignedSemesters: [...(u.assignedSemesters || []), semesterId!] };
      } else if (!shouldBeAssigned && isCurrentlyAssigned) {
        // If we want to allow only one instructor per semester, 
        // we might need to remove this semester from the previous instructor's list.
        return { ...u, assignedSemesters: (u.assignedSemesters || []).filter(id => id !== semesterId) };
      }
      return u;
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
        // Remove semester from all admins
        setAllUsers(allUsers.map(u => {
          if (u.role !== 'admin') return u;
          return { ...u, assignedSemesters: (u.assignedSemesters || []).filter(sid => sid !== semId) };
        }));
      }
    });
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedSemesterId) return;
    
    let subjectId = editingSubject.id;
    const instructorId = editingSubject.instructorId;

    setAllCourses(allCourses.map(course => {
      if (course.id !== selectedCourseId) return course;
      
      return {
        ...course,
        semesters: course.semesters.map(sem => {
          if (sem.id !== selectedSemesterId) return sem;
          
          if (subjectId) {
            return {
              ...sem,
              subjects: sem.subjects.map(sub => sub.id === subjectId ? { ...sub, name: editingSubject.name, instructorId } : sub)
            };
          } else {
            subjectId = `sub${sem.subjects.length + 1}`;
            const newSubject = {
              id: subjectId,
              name: editingSubject.name,
              instructorId
            };
            return {
              ...sem,
              subjects: [...sem.subjects, newSubject]
            };
          }
        })
      };
    }));

    // Sync users state for assignedSubjects
    setAllUsers(allUsers.map(u => {
      if (u.role !== 'admin') return u;
      
      const isCurrentlyAssigned = u.assignedSubjects?.includes(subjectId!);
      const shouldBeAssigned = u.id === instructorId;

      if (shouldBeAssigned && !isCurrentlyAssigned) {
        return { ...u, assignedSubjects: [...(u.assignedSubjects || []), subjectId!] };
      } else if (!shouldBeAssigned && isCurrentlyAssigned) {
        return { ...u, assignedSubjects: (u.assignedSubjects || []).filter(id => id !== subjectId) };
      }
      return u;
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
        // Remove subject from all admins
        setAllUsers(allUsers.map(u => {
          if (u.role !== 'admin') return u;
          return { ...u, assignedSubjects: (u.assignedSubjects || []).filter(sid => sid !== subId) };
        }));
        // Also remove topics for this subject
        setAllTopics(allTopics.filter(t => t.subjectId !== subId));
      }
    });
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedSemesterId) return;

    if (editingTopic.id) {
      setAllTopics(allTopics.map(t => t.id === editingTopic.id ? { ...t, ...editingTopic } : t));
    } else {
      const newTopic = {
        ...editingTopic,
        id: `t${allTopics.length + 1}`,
        subjectId: selectedSubjectId,
        semesterId: selectedSemesterId
      };
      setAllTopics([...allTopics, newTopic]);
    }

    setIsTopicModalOpen(false);
    setEditingTopic({ title: '', content: '', imageUrl: '', videoUrl: '', section: '' });
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

  const handleDeleteUser = (id: string, role: 'admin' | 'student') => {
    setConfirmModal({
      isOpen: true,
      title: role === 'admin' ? 'Revoke Admin Access' : 'Remove Student',
      message: `Are you sure you want to ${role === 'admin' ? 'revoke access for this administrator' : 'remove this student'}? This action cannot be undone.`,
      onConfirm: () => {
        setAllUsers(allUsers.filter(u => u.id !== id));
      }
    });
  };

  const handleAssignInstructor = (courseId: string, instructorId: string) => {
    // Update courses state
    setAllCourses(allCourses.map(c => 
      c.id === courseId ? { ...c, instructorId } : c
    ));

    // Update users state to sync assignedCourses
    setAllUsers(allUsers.map(u => {
      if (u.role !== 'admin') return u;
      
      const isCurrentlyAssigned = u.assignedCourses?.includes(courseId);
      const shouldBeAssigned = u.id === instructorId;

      if (shouldBeAssigned && !isCurrentlyAssigned) {
        return { ...u, assignedCourses: [...(u.assignedCourses || []), courseId] };
      } else if (!shouldBeAssigned && isCurrentlyAssigned) {
        // If we want to allow only one instructor per course, 
        // we might need to remove this course from the previous instructor's list.
        // But for simplicity, let's just add it to the new one.
        // Actually, the request implies one instructor per course.
        return { ...u, assignedCourses: (u.assignedCourses || []).filter(id => id !== courseId) };
      }
      return u;
    }));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141414] border-r border-white/5 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">WebDataX</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'system', icon: Server, label: 'System Health' },
              { id: 'admins', icon: Users, label: 'Manage Admins' },
              { id: 'students', icon: Users, label: 'Manage Students' },
              { id: 'courses', icon: BookOpen, label: 'All Courses' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
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
            <h2 className="text-3xl font-bold tracking-tight">Super Admin Control</h2>
            <p className="text-white/40">Global System Management</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder={`Search ${activeSection}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
             <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-all">
              System Logs
            </button>
            <button 
              onClick={() => {
                setUserForm({
                  id: '',
                  name: '',
                  email: '',
                  password: '',
                  role: activeSection === 'students' ? 'student' : 'admin',
                  courseId: 'dit-1y',
                  semesterId: 'sem-1'
                });
                setIsUserModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              New User
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSection === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Server Load', value: '12%', icon: Activity, color: 'text-green-500' },
                  { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-500' },
                  { label: 'DB Status', value: 'Healthy', icon: Database, color: 'text-purple-500' },
                  { label: 'Global Traffic', value: '4.2k', icon: Globe, color: 'text-orange-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Live</span>
                    </div>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6">Recent Admin Actions</h3>
                  <div className="space-y-6">
                    {[
                      { admin: 'Admin User', action: 'Added 5 new topics to Semester 1', time: '10m ago' },
                      { admin: 'System', action: 'Automated backup completed', time: '1h ago' },
                      { admin: 'Super Admin', action: 'Updated system security protocols', time: '3h ago' }
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1 h-10 bg-purple-600 rounded-full" />
                        <div>
                          <p className="text-sm font-bold">{log.admin}</p>
                          <p className="text-sm text-white/50">{log.action}</p>
                          <p className="text-[10px] text-white/20 font-mono mt-1">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6">Course Distribution</h3>
                  <div className="space-y-4">
                    {allCourses.map((course) => (
                      <div key={course.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold">{course.name}</p>
                          <p className="text-xs text-white/30">{course.semesters.length} Semesters • 12 Subjects</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">842 Students</p>
                          <div className="w-32 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <div className="w-[75%] h-full bg-purple-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeSection === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-xl">System Administrators</h3>
                  <button 
                    onClick={() => {
                      setUserForm({
                        id: '',
                        name: '',
                        email: '',
                        password: '',
                        role: 'admin',
                        courseId: 'dit-1y',
                        semesterId: 'sem-1'
                      });
                      setIsUserModalOpen(true);
                    }}
                    className="bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New User
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allUsers.filter(u => u.role === 'admin' && (
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )).map(admin => (
                    <div key={admin.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-lg">
                          {admin.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold">{admin.name}</h4>
                          <p className="text-xs text-white/40">{admin.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Assigned Courses</span>
                          <span className="text-white/60">{admin.assignedCourses?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Permissions</span>
                          <span className="text-white/60">Full Access</span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <button 
                          onClick={() => {
                            setUserForm({
                              id: admin.id,
                              name: admin.name,
                              email: admin.email,
                              password: admin.password || '',
                              role: admin.role as 'admin' | 'student',
                              courseId: admin.courseId || 'dit-1y',
                              semesterId: admin.semesterId || 'sem-1'
                            });
                            setIsUserModalOpen(true);
                          }}
                          className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(admin.id, 'admin')}
                          className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-xl">Manage Students</h3>
                  <button 
                    onClick={() => {
                      setUserForm({
                        id: '',
                        name: '',
                        email: '',
                        password: '',
                        role: 'student',
                        courseId: 'dit-1y',
                        semesterId: 'sem-1'
                      });
                      setIsUserModalOpen(true);
                    }}
                    className="bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New Student
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allUsers.filter(u => u.role === 'student' && (
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )).map(student => (
                    <div key={student.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-lg">
                          {student.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold">{student.name}</h4>
                          <p className="text-xs text-white/40">{student.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Course</span>
                          <span className="text-white/60">{allCourses.find(c => c.id === student.courseId)?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/30">Semester</span>
                          <span className="text-white/60">
                            {allCourses.find(c => c.id === student.courseId)?.semesters.find(s => s.id === student.semesterId)?.name || student.semesterId || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <button 
                          onClick={() => {
                            setUserForm({
                              id: student.id,
                              name: student.name,
                              email: student.email,
                              password: student.password || '',
                              role: student.role as 'admin' | 'student',
                              courseId: student.courseId || 'dit-1y',
                              semesterId: student.semesterId || 'sem-1'
                            });
                            setIsUserModalOpen(true);
                          }}
                          className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(student.id, 'student')}
                          className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'courses' && (
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
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {allCourses.map(course => (
                  <div key={course.id} className="bg-[#141414] border border-white/5 rounded-3xl p-8 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          {renamingCourseId === course.id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text"
                                value={tempCourseName}
                                onChange={(e) => setTempCourseName(e.target.value)}
                                className="bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-lg font-bold focus:outline-none focus:border-purple-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameCourse(course.id);
                                  if (e.key === 'Escape') setRenamingCourseId(null);
                                }}
                              />
                              <button 
                                onClick={() => handleRenameCourse(course.id)}
                                className="bg-purple-600 p-1.5 rounded-lg hover:bg-purple-700 transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setRenamingCourseId(null)}
                                className="bg-white/5 p-1.5 rounded-lg hover:bg-white/10 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/title">
                              <h3 className="text-2xl font-bold">{course.name}</h3>
                              <button 
                                onClick={() => {
                                  setRenamingCourseId(course.id);
                                  setTempCourseName(course.name);
                                }}
                                className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/5 rounded text-white/20 hover:text-white transition-all"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {course.description && (
                            <p className="text-sm text-white/40 mt-1 max-w-2xl">{course.description}</p>
                          )}
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-white/40 text-sm">Instructor:</span>
                            <select 
                              value={course.instructorId || ''}
                              onChange={(e) => handleAssignInstructor(course.id, e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-500 transition-all"
                            >
                              <option value="" className="bg-[#141414]">Not Assigned</option>
                              {allUsers.filter(u => u.role === 'admin').map(admin => (
                                <option key={admin.id} value={admin.id} className="bg-[#141414]">{admin.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCourse({ id: course.id, name: course.name, description: course.description, instructorId: course.instructorId });
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
                          className="text-xs font-bold text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Semester
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.semesters.map(semester => (
                          <div key={semester.id} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex flex-col">
                                <h5 className="font-bold">{semester.name}</h5>
                                {semester.instructorId && (
                                  <span className="text-[10px] text-white/40 italic">
                                    Instructor: {allUsers.find(u => u.id === semester.instructorId)?.name || 'Unknown'}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    setEditingSemester({ id: semester.id, name: semester.name, instructorId: semester.instructorId });
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
                                  className="text-[10px] font-bold text-purple-500/60 hover:text-purple-500 transition-all"
                                >
                                  + Add Subject
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {semester.subjects.map(subject => (
                                  <div key={subject.id} className="w-full">
                                      <div className="group flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl text-sm mb-2">
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-3">
                                            <span className="font-bold">{subject.name}</span>
                                            <span className="text-[10px] text-white/20 uppercase tracking-widest">
                                              {allTopics.filter(t => t.subjectId === subject.id).length} Topics
                                            </span>
                                          </div>
                                          {subject.instructorId && (
                                            <span className="text-[9px] text-white/40 italic">
                                              Instructor: {allUsers.find(u => u.id === subject.instructorId)?.name || 'Unknown'}
                                            </span>
                                          )}
                                        </div>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                          onClick={() => {
                                            setSelectedSemesterId(semester.id);
                                            setSelectedSubjectId(subject.id);
                                            setEditingTopic({ title: '', content: '', imageUrl: '', videoUrl: '', section: '' });
                                            setIsTopicModalOpen(true);
                                          }}
                                          className="p-1.5 hover:bg-purple-500/20 text-purple-500 rounded-lg transition-all"
                                          title="Add Topic"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setSelectedCourseId(course.id);
                                            setSelectedSemesterId(semester.id);
                                            setEditingSubject({ id: subject.id, name: subject.name, instructorId: subject.instructorId });
                                            setIsSubjectModalOpen(true);
                                          }}
                                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all"
                                        >
                                          <Settings className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteSubject(course.id, semester.id, subject.id)}
                                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-all"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Topics List */}
                                    <div className="pl-4 space-y-1 mb-4">
                                      {allTopics.filter(t => t.subjectId === subject.id).map(topic => (
                                        <div key={topic.id} className="group flex items-center justify-between py-1 px-3 rounded-lg hover:bg-white/5 transition-all">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-white/20">{topic.section}</span>
                                            <span className="text-xs text-white/60">{topic.title}</span>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                              onClick={() => {
                                                setSelectedSemesterId(semester.id);
                                                setSelectedSubjectId(subject.id);
                                                setEditingTopic({ 
                                                  id: topic.id, 
                                                  title: topic.title, 
                                                  content: topic.content, 
                                                  imageUrl: topic.imageUrl || '', 
                                                  videoUrl: topic.videoUrl || '',
                                                  section: topic.section || ''
                                                });
                                                setIsTopicModalOpen(true);
                                              }}
                                              className="p-1 text-white/20 hover:text-purple-500 transition-all"
                                            >
                                              <Settings className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteTopic(topic.id)}
                                              className="p-1 text-white/20 hover:text-red-500 transition-all"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
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

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{userForm.id ? 'Edit User' : 'Create New User'}</h3>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Role</label>
                  <div className="flex gap-2">
                    {['admin', 'student'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setUserForm({ ...userForm, role: r as any })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                          userForm.role === r 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Password</label>
                  <input 
                    type="password" 
                    required={!userForm.id}
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder={userForm.id ? "Leave blank to keep current" : "••••••••"}
                  />
                </div>

                {userForm.role === 'student' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Course</label>
                      <select 
                        required
                        value={userForm.courseId}
                        onChange={(e) => setUserForm({...userForm, courseId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      >
                        {allCourses.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#141414]">{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Semester</label>
                      <select 
                        required
                        value={userForm.semesterId}
                        onChange={(e) => setUserForm({...userForm, semesterId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="sem-1" className="bg-[#141414]">Semester 1</option>
                        <option value="sem-2" className="bg-[#141414]">Semester 2</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                  >
                    {userForm.id ? 'Save Changes' : 'Create User'}
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="e.g. Diploma in Information Technology"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Description</label>
                  <textarea 
                    value={editingCourse.description || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all min-h-[100px]"
                    placeholder="Brief overview of the course content and goals..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Assign Instructor</label>
                  <select 
                    value={editingCourse.instructorId || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, instructorId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                  >
                    <option value="" className="bg-[#141414]">Select Instructor</option>
                    {allUsers.filter(u => u.role === 'admin').map(admin => (
                      <option key={admin.id} value={admin.id} className="bg-[#141414]">{admin.name}</option>
                    ))}
                  </select>
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
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="e.g. Semester 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Assign Instructor</label>
                  <select 
                    value={editingSemester.instructorId || ''}
                    onChange={(e) => setEditingSemester({...editingSemester, instructorId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                  >
                    <option value="" className="bg-[#141414]">Select Instructor</option>
                    {allUsers.filter(u => u.role === 'admin').map(admin => (
                      <option key={admin.id} value={admin.id} className="bg-[#141414]">{admin.name}</option>
                    ))}
                  </select>
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
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Assign Instructor</label>
                  <select 
                    value={editingSubject.instructorId || ''}
                    onChange={(e) => setEditingSubject({...editingSubject, instructorId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                  >
                    <option value="" className="bg-[#141414]">Select Instructor</option>
                    {allUsers.filter(u => u.role === 'admin').map(admin => (
                      <option key={admin.id} value={admin.id} className="bg-[#141414]">{admin.name}</option>
                    ))}
                  </select>
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
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                  >
                    Save Subject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topic Modal */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTopicModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold mb-6">{editingTopic.id ? 'Edit Topic' : 'Add New Topic'}</h3>
              <form onSubmit={handleSaveTopic} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Topic Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingTopic.title}
                      onChange={(e) => setEditingTopic({...editingTopic, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="e.g. Introduction to React"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Section Number</label>
                    <input 
                      type="text" 
                      value={editingTopic.section}
                      onChange={(e) => setEditingTopic({...editingTopic, section: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="e.g. 1.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Text Details (Content)</label>
                  <textarea 
                    required
                    value={editingTopic.content}
                    onChange={(e) => setEditingTopic({...editingTopic, content: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all min-h-[150px]"
                    placeholder="Detailed explanation of the topic..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Image URL</label>
                    <input 
                      type="url" 
                      value={editingTopic.imageUrl}
                      onChange={(e) => setEditingTopic({...editingTopic, imageUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Video URL (Embed)</label>
                    <input 
                      type="url" 
                      value={editingTopic.videoUrl}
                      onChange={(e) => setEditingTopic({...editingTopic, videoUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsTopicModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 font-bold text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                  >
                    {editingTopic.id ? 'Save Changes' : 'Add Topic'}
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
