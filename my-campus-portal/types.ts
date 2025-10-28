// types.ts

export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY', // New role
  ADMIN = 'ADMIN',     // New role
}

export interface User {
  id: string;
  name: string;
  registrationId: string;
  role: UserRole;
  email?: string; // New field
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  facultyId?: string; // New field to assign faculty to courses
}

export interface Exam {
  id: string;
  courseId: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
}

export interface EnrolledCourse {
  course: Course;
  registrationDate: string;
}

export interface EnrolledExam {
  exam: Exam;
  enrollmentDate: string;
  course: Course;
}

export enum CourseApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CourseApplication {
  id: string;
  studentId: string;
  course: Course; // Full course object
  applicationDate: string;
  status: CourseApplicationStatus;
}

export interface FacultyCourseAssignment {
  facultyId: string;
  courseId: string;
}

export interface StudentDashboardData {
  enrolledCourses: EnrolledCourse[];
  enrolledExams: EnrolledExam[];
  courseApplications: CourseApplication[]; // New: Show student's course applications
}

export interface FacultyDashboardData {
  assignedCourses: (Course & {
    students: (User & {
      enrolledExams: EnrolledExam[];
    })[];
  })[];
}

export interface AdminDashboardData {
  pendingCourseApplications: CourseApplication[];
  allUsers: User[];
  allCourses: Course[];
  allExams: Exam[];
}


export enum AppState {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP', // New state
  DASHBOARD = 'DASHBOARD', // Student Dashboard
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD', // New state
  FACULTY_DASHBOARD = 'FACULTY_DASHBOARD', // New state
  COURSE_REGISTRATION = 'COURSE_REGISTRATION',
  EXAM_ENROLLMENT = 'EXAM_ENROLLMENT',
  ERROR = 'ERROR',
}

export interface LoginCredentials {
  registrationId: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  registrationId: string;
  email: string;
  password: string;
  role?: UserRole; // Optional, defaults to student
}

export interface CourseApplicationPayload {
  studentId: string;
  courseId: string;
}

export interface ExamEnrollmentPayload {
  studentId: string;
  examId: string;
}

export interface UpdateCourseApplicationStatusPayload {
  applicationId: string;
  status: CourseApplicationStatus;
}

export interface AddCoursePayload {
  name: string;
  code: string;
  description: string;
  credits: number;
  facultyId?: string;
}

export interface AddExamPayload {
  courseId: string;
  name: string;
  date: string;
  time: string;
  location: string;
}
