export type UserRole = 'super_admin' | 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  courseId?: string;
  semesterId?: string;
  assignedCourses?: string[];
  assignedSemesters?: string[];
  assignedSubjects?: string[];
}

export interface Subject {
  id: string;
  name: string;
  instructorId?: string;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
  instructorId?: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  instructorId?: string;
  semesters: Semester[];
}

export interface Topic {
  id: string;
  subjectId: string;
  semesterId: string;
  title: string;
  section?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  questions: Question[];
}
