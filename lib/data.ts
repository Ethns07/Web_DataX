import { User, Course, Topic, Quiz } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'dit-1y',
    name: 'Diploma Information Technology (1-Year)',
    description: 'A comprehensive 1-year diploma program covering the essentials of modern IT, from web development to database management and networking.',
    semesters: [
      {
        id: 'sem-1',
        name: 'Semester 1',
        subjects: [
          { id: 'web-dev-1', name: 'Web Development Essentials' },
          { id: 'db-sys-1', name: 'Database Systems' },
          { id: 'office-auto', name: 'Office Automation' }
        ]
      },
      {
        id: 'sem-2',
        name: 'Semester 2',
        subjects: [
          { id: 'adv-web', name: 'Advanced Web Development' },
          { id: 'networking', name: 'Computer Networking' },
          { id: 'prog-c', name: 'Programming in C' }
        ]
      }
    ]
  }
];

export const MOCK_TOPICS: Topic[] = [
  {
    id: 'internet-basics',
    subjectId: 'web-dev-1',
    semesterId: 'sem-1',
    section: '1.0',
    title: 'Internet Basics',
    content: 'Understanding how the internet works, including protocols like HTTP, DNS, and the client-server model.',
    imageUrl: 'https://picsum.photos/seed/internet/800/400',
    videoUrl: 'https://www.youtube.com/embed/x3c1ih2NJe8'
  },
  {
    id: 'html-basics',
    subjectId: 'web-dev-1',
    semesterId: 'sem-1',
    section: '2.0',
    title: 'HTML Basics',
    content: 'HTML (HyperText Markup Language) is the most basic building block of the Web. It defines the meaning and structure of web content.',
    imageUrl: 'https://picsum.photos/seed/html/800/400',
    videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU'
  },
  {
    id: 'css-styling',
    subjectId: 'web-dev-1',
    semesterId: 'sem-1',
    section: '3.0',
    title: 'CSS Styling',
    content: 'Cascading Style Sheets (CSS) is a stylesheet language used for describing the presentation of a document written in HTML.',
    imageUrl: 'https://picsum.photos/seed/css/800/400',
    videoUrl: 'https://www.youtube.com/embed/yfoY53QXEnI'
  },
  {
    id: 'js-intro',
    subjectId: 'web-dev-1',
    semesterId: 'sem-1',
    section: '4.0',
    title: 'JavaScript Introduction',
    content: 'JavaScript is a programming language that allows you to implement complex features on web pages.',
    imageUrl: 'https://picsum.photos/seed/javascript/800/400',
    videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk'
  },
  {
    id: 'db-concepts',
    subjectId: 'db-sys-1',
    semesterId: 'sem-1',
    section: '5.0',
    title: 'Database Concepts',
    content: 'Introduction to databases, relational models, and the importance of data management.',
    imageUrl: 'https://picsum.photos/seed/database/800/400',
    videoUrl: 'https://www.youtube.com/embed/Tk1t3WKK-nQ'
  },
  {
    id: 'sql-intro',
    subjectId: 'db-sys-1',
    semesterId: 'sem-1',
    section: '5.2',
    title: 'Introduction to SQL',
    content: 'SQL (Structured Query Language) is a standard language for accessing and manipulating databases.',
    imageUrl: 'https://picsum.photos/seed/sql/800/400',
    videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY'
  }
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'web-quiz-1',
    subjectId: 'web-dev-1',
    title: 'Web Development Basics Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: [
          'HyperText Markup Language',
          'HighText Machine Language',
          'HyperText Markdown Language',
          'None of the above'
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        question: 'Which tag is used for the largest heading?',
        options: ['<h6>', '<head>', '<h1>', '<header>'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'db-quiz-1',
    subjectId: 'db-sys-1',
    title: 'Database Fundamentals Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What does SQL stand for?',
        options: [
          'Structured Query Language',
          'Simple Query Language',
          'Strong Query Language',
          'None of the above'
        ],
        correctAnswer: 0
      }
    ]
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Super Admin',
    email: 'masif4732714@gmail.com',
    role: 'super_admin',
    password: 'masif123455'
  },
  {
    id: 'u2',
    name: 'Admin User',
    email: 'admin@webdatax.com',
    role: 'admin',
    password: 'password',
    assignedCourses: ['dit-1y']
  },
  {
    id: 'u3',
    name: 'Student User',
    email: 'student@webdatax.com',
    role: 'student',
    password: 'password',
    courseId: 'dit-1y',
    semesterId: 'sem-1'
  }
];
