'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Search, 
  Play, 
  Star, 
  Globe, 
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';

const courses = [
  {
    id: 1,
    title: "Data Science Fundamentals",
    instructor: "Dr. Sarah Chen",
    rating: 4.9,
    students: "12.4k",
    price: "$89.99",
    image: "https://picsum.photos/seed/data/600/400",
    category: "Data Science"
  },
  {
    id: 2,
    title: "Advanced Web Development",
    instructor: "Marcus Thorne",
    rating: 4.8,
    students: "8.2k",
    price: "$74.99",
    image: "https://picsum.photos/seed/web/600/400",
    category: "Development"
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Elena Rodriguez",
    rating: 4.9,
    students: "15.1k",
    price: "$94.99",
    image: "https://picsum.photos/seed/design/600/400",
    category: "Design"
  },
  {
    id: 4,
    title: "Digital Marketing Strategy",
    instructor: "James Wilson",
    rating: 4.7,
    students: "6.5k",
    price: "$69.99",
    image: "https://picsum.photos/seed/marketing/600/400",
    category: "Business"
  }
];

import { useAuth } from '@/lib/auth-context';
import LoginPage from '@/components/login-page';
import StudentDashboard from '@/components/student-dashboard';
import AdminDashboard from '@/components/admin-dashboard';
import SuperAdminDashboard from '@/components/super-admin-dashboard';

export default function Page() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    default:
      return <LoginPage />;
  }
}
