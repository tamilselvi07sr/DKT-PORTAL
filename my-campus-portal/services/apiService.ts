// services/apiService.ts
import {
  LoginCredentials,
  SignupCredentials,
  User,
  UserRole,
  Course,
  Exam,
  CourseApplicationPayload,
  ExamEnrollmentPayload,
  StudentDashboardData,
  EnrolledCourse,
  EnrolledExam,
  CourseApplication,
  CourseApplicationStatus,
  UpdateCourseApplicationStatusPayload,
  FacultyDashboardData,
  AddCoursePayload,
  AddExamPayload,
  AdminDashboardData,
} from '../types';
// Fix: Use relative import path for constants
import { REGISTRATION_ID_REGEX, MIN_PASSWORD_LENGTH, EMAIL_REGEX, FACULTY_ID_REGEX, ADMIN_ID_REGEX } from '../constants';

// --- Conceptual Network Service (Simulation) ---
// This service simulates backend network activities related to P2P, subnetting, and NAT.
// In a real application, these would be handled by the actual backend infrastructure.
const networkService = {
  simulatePeerConnection(ipAddress1: string, ipAddress2: string) {
    console.log(`[Network Simulation] Establishing secure P2P connection between ${ipAddress1} and ${ipAddress2}`);
    // Simulate latency or encryption setup
  },
  simulateSubnetting(networkAddress: string, subnetMask: string) {
    console.log(`[Network Simulation] Applying subnetting to ${networkAddress} with mask ${subnetMask}`);
    // Simulate routing table updates
  },
  simulateNatTranslation(privateIp: string, publicIp: string) {
    console.log(`[Network Simulation] Performing NAT translation: ${privateIp} -> ${publicIp}`);
    // Simulate firewall rules
  },
  getNetworkLogs(): string[] {
    // In a real scenario, this would fetch logs from a monitoring system
    return [
      `[${new Date().toLocaleTimeString()}] P2P connection established: client A <-> server`,
      `[${new Date().toLocaleTimeString()}] Subnet 'student-network' configured (192.168.1.0/24)`,
      `[${new Date().toLocaleTimeString()}] NAT rule applied for student traffic`,
      `[${new Date().toLocaleTimeString()}] Secure communication channel active`
    ];
  }
};
// --- End Conceptual Network Service ---

// --- Mock Data ---
let nextUserId = 4;
let nextCourseId = 6;
let nextExamId = 5;
let nextApplicationId = 1;

const mockUsers: User[] = [
  { id: 'u001', name: 'Alice Smith', registrationId: 'S-0001', role: UserRole.STUDENT, email: 'alice.s@campus.edu' },
  { id: 'u002', name: 'Bob Johnson', registrationId: 'S-0002', role: UserRole.STUDENT, email: 'bob.j@campus.edu' },
  { id: 'u003', name: 'Charlie Davis', registrationId: 'F-0001', role: UserRole.FACULTY, email: 'charlie.d@campus.edu' },
  { id: 'u004', name: 'Admin User', registrationId: 'A-0001', role: UserRole.ADMIN, email: 'admin@campus.edu' },
];

const mockPasswords = new Map<string, string>([
  ['S-0001', 'password123'],
  ['S-0002', 'password123'],
  ['F-0001', 'password123'],
  ['A-0001', 'password123'],
]);

let mockCourses: Course[] = [
  { id: 'c001', name: 'Introduction to Programming', code: 'CS101', description: 'Fundamentals of programming.', credits: 3, facultyId: 'u003' },
  { id: 'c002', name: 'Data Structures & Algorithms', code: 'CS201', description: 'Advanced data structures.', credits: 4, facultyId: 'u003' },
  { id: 'c003', name: 'Calculus I', code: 'MA101', description: 'Basic calculus concepts.', credits: 4 },
  { id: 'c004', name: 'History of Art', code: 'AR101', description: 'Survey of art history.', credits: 3 },
  { id: 'c005', name: 'Operating Systems', code: 'CS301', description: 'Principles of modern OS.', credits: 5 },
];

let mockExams: Exam[] = [
  { id: 'e001', courseId: 'c001', name: 'Midterm Exam - CS101', date: '2024-05-15', time: '10:00', location: 'Room 101' },
  { id: 'e002', courseId: 'c001', name: 'Final Exam - CS101', date: '2024-05-28', time: '14:00', location: 'Auditorium' },
  { id: 'e003', courseId: 'c002', name: 'Midterm Exam - CS201', date: '2024-05-18', time: '09:00', location: 'Lab A' },
  { id: 'e004', courseId: 'c003', name: 'Final Exam - MA101', date: '2024-06-01', time: '13:00', location: 'Room 205' },
];

// In-memory store for registered courses, exam enrollments, and course applications
const mockStudentCourseRegistrations = new Map<string, EnrolledCourse[]>(); // studentId -> EnrolledCourse[]
const mockStudentExamEnrollments = new Map<string, EnrolledExam[]>(); // studentId -> EnrolledExam[]
const mockCourseApplications = new Map<string, CourseApplication>(); // applicationId -> CourseApplication

// Initial mock data for S-0001
const initialCourse001 = mockCourses.find(c => c.id === 'c001')!;
mockStudentCourseRegistrations.set('u001', [
  { course: initialCourse001, registrationDate: '2024-01-01' },
]);
mockCourseApplications.set('app001', {
  id: 'app001', studentId: 'u001', course: mockCourses.find(c => c.id === 'c002')!,
  applicationDate: '2024-03-01', status: CourseApplicationStatus.PENDING
});
mockStudentExamEnrollments.set('u001', [
  { exam: mockExams[0], enrollmentDate: '2024-03-01', course: initialCourse001 },
]);


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const apiService = {
  /**
   * Simulates user login.
   * @param credentials - User's registration ID and password.
   * @returns A promise that resolves with the User object or rejects with an error.
   */
  async loginUser(credentials: LoginCredentials): Promise<User> {
    await delay(1000); // Simulate network delay
    networkService.simulatePeerConnection('127.0.0.1', 'campus-backend.edu'); // Conceptual P2P
    networkService.simulateNatTranslation('192.168.0.100', '203.0.113.45'); // Conceptual NAT

    if (!REGISTRATION_ID_REGEX.test(credentials.registrationId) &&
        !FACULTY_ID_REGEX.test(credentials.registrationId) &&
        !ADMIN_ID_REGEX.test(credentials.registrationId)) {
      throw new Error('Invalid registration ID format. Expected S-XXXX, F-XXXX, or A-XXXX.');
    }
    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    const user = mockUsers.find(u => u.registrationId === credentials.registrationId);

    // Simple mock password check
    if (user && mockPasswords.get(credentials.registrationId) === credentials.password) {
      console.log(`User ${user.name} (${user.role}) logged in.`);
      return { ...user }; // Return a copy
    } else {
      throw new Error('Invalid credentials.');
    }
  },

  /**
   * Simulates user registration (signup).
   * Defaults to STUDENT role for self-registration.
   * @param credentials - User's details for registration.
   * @returns A promise that resolves with the new User object or rejects with an error.
   */
  async registerUser(credentials: SignupCredentials): Promise<User> {
    await delay(1500); // Simulate network delay

    if (!credentials.name || credentials.name.trim() === '') {
      throw new Error('Name is required.');
    }
    if (!credentials.registrationId || !REGISTRATION_ID_REGEX.test(credentials.registrationId)) {
      throw new Error('Invalid registration ID format. Expected S-XXXX.');
    }
    if (mockUsers.some(u => u.registrationId === credentials.registrationId)) {
      throw new Error('Registration ID already exists.');
    }
    if (!credentials.email || !EMAIL_REGEX.test(credentials.email)) {
      throw new Error('Invalid email format.');
    }
    if (mockUsers.some(u => u.email === credentials.email)) {
      throw new Error('Email already registered.');
    }
    if (!credentials.password || credentials.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }

    const newUser: User = {
      id: `u${++nextUserId}`,
      name: credentials.name,
      registrationId: credentials.registrationId,
      email: credentials.email,
      role: credentials.role || UserRole.STUDENT, // Default to student
    };

    mockUsers.push(newUser);
    mockPasswords.set(credentials.registrationId, credentials.password); // Store mock password
    console.log(`New user ${newUser.name} (${newUser.registrationId}) registered.`);
    return { ...newUser };
  },

  /**
   * Simulates fetching all available courses.
   * @returns A promise that resolves with an array of Course objects.
   */
  async fetchCourses(): Promise<Course[]> {
    await delay(500); // Simulate network delay
    return [...mockCourses];
  },

  /**
   * Simulates a student applying for a course.
   * The application initially goes into a PENDING state.
   * @param payload - Student ID and Course ID.
   * @returns A promise that resolves with the CourseApplication or rejects with an error.
   */
  async submitCourseApplication(payload: CourseApplicationPayload): Promise<CourseApplication> {
    await delay(1000); // Simulate network delay

    const student = mockUsers.find(u => u.id === payload.studentId && u.role === UserRole.STUDENT);
    const course = mockCourses.find(c => c.id === payload.courseId);

    if (!student) {
      throw new Error('Student not found.');
    }
    if (!course) {
      throw new Error('Course not found.');
    }

    // Check if already registered (approved)
    const currentRegistrations = mockStudentCourseRegistrations.get(payload.studentId) || [];
    if (currentRegistrations.some(reg => reg.course.id === payload.courseId)) {
      throw new Error('Student is already registered for this course.');
    }

    // Check if there's an existing pending application
    const existingApplication = Array.from(mockCourseApplications.values()).find(
      app => app.studentId === payload.studentId && app.course.id === payload.courseId && app.status === CourseApplicationStatus.PENDING
    );
    if (existingApplication) {
      throw new Error('You already have a pending application for this course.');
    }

    const newApplication: CourseApplication = {
      id: `app${nextApplicationId++}`,
      studentId: payload.studentId,
      course: course,
      applicationDate: new Date().toISOString().split('T')[0],
      status: CourseApplicationStatus.PENDING,
    };

    mockCourseApplications.set(newApplication.id, newApplication);
    console.log(`Student ${student.name} applied for ${course.name}. Application ID: ${newApplication.id}`);
    return { ...newApplication };
  },

  /**
   * Simulates fetching all available exams.
   * @returns A promise that resolves with an array of Exam objects.
   */
  async fetchAvailableExams(): Promise<Exam[]> {
    await delay(500); // Simulate network delay
    return [...mockExams];
  },

  /**
   * Simulates enrolling a student in an exam.
   * @param payload - Student ID and Exam ID.
   * @returns A promise that resolves on success or rejects with an error.
   */
  async enrollInExam(payload: ExamEnrollmentPayload): Promise<void> {
    await delay(1000); // Simulate network delay

    const student = mockUsers.find(u => u.id === payload.studentId && u.role === UserRole.STUDENT);
    const exam = mockExams.find(e => e.id === payload.examId);

    if (!student) {
      throw new Error('Student not found.');
    }
    if (!exam) {
      throw new Error('Exam not found.');
    }

    const courseForExam = mockCourses.find(c => c.id === exam.courseId);
    if (!courseForExam) {
      throw new Error(`Course not found for exam ID ${exam.id}.`);
    }

    // Check if student is actually registered for the course linked to the exam
    const isStudentRegisteredForCourse = (mockStudentCourseRegistrations.get(payload.studentId) || [])
                                        .some(reg => reg.course.id === exam.courseId);
    if (!isStudentRegisteredForCourse) {
      throw new Error(`You must be registered for course ${courseForExam.code} to enroll in this exam.`);
    }


    const currentEnrollments = mockStudentExamEnrollments.get(payload.studentId) || [];
    if (currentEnrollments.some(enroll => enroll.exam.id === payload.examId)) {
      throw new Error('Student is already enrolled in this exam.');
    }

    currentEnrollments.push({ exam, enrollmentDate: new Date().toISOString().split('T')[0], course: courseForExam });
    mockStudentExamEnrollments.set(payload.studentId, currentEnrollments);
    console.log(`Student ${student.name} enrolled in ${exam.name}.`);
  },

  /**
   * Simulates fetching student-specific dashboard data (enrolled courses, exams, and applications).
   * @param userId - The ID of the student.
   * @returns A promise that resolves with StudentDashboardData.
   */
  async fetchStudentDashboardData(userId: string): Promise<StudentDashboardData> {
    await delay(750); // Simulate network delay

    const enrolledCourses = mockStudentCourseRegistrations.get(userId) || [];
    const enrolledExams: EnrolledExam[] = (mockStudentExamEnrollments.get(userId) || []).map(enrollment => {
      const courseForExam = mockCourses.find(c => c.id === enrollment.exam.courseId);
      if (!courseForExam) {
        console.warn(`Course not found for exam ID ${enrollment.exam.id}`);
        throw new Error(`Associated course not found for exam: ${enrollment.exam.name}`);
      }
      return { ...enrollment, course: courseForExam };
    });
    const courseApplications = Array.from(mockCourseApplications.values()).filter(app => app.studentId === userId);

    return {
      enrolledCourses: [...enrolledCourses],
      enrolledExams: [...enrolledExams],
      courseApplications: [...courseApplications],
    };
  },

  /**
   * Simulates fetching pending course applications for admin review.
   * @returns A promise that resolves with an array of CourseApplication objects.
   */
  async fetchPendingCourseApplications(): Promise<CourseApplication[]> {
    await delay(1000);
    return Array.from(mockCourseApplications.values())
                 .filter(app => app.status === CourseApplicationStatus.PENDING);
  },

  /**
   * Simulates updating the status of a course application (Admin action).
   * @param payload - Application ID and new status.
   * @returns A promise that resolves on success or rejects with an error.
   */
  async updateCourseApplicationStatus(payload: UpdateCourseApplicationStatusPayload): Promise<void> {
    await delay(1500);

    const application = mockCourseApplications.get(payload.applicationId);
    if (!application) {
      throw new Error('Course application not found.');
    }

    if (payload.status === CourseApplicationStatus.APPROVED) {
      // Add to student's enrolled courses if approved
      const currentRegistrations = mockStudentCourseRegistrations.get(application.studentId) || [];
      if (!currentRegistrations.some(reg => reg.course.id === application.course.id)) {
        currentRegistrations.push({ course: application.course, registrationDate: new Date().toISOString().split('T')[0] });
        mockStudentCourseRegistrations.set(application.studentId, currentRegistrations);
      }
    } else if (payload.status === CourseApplicationStatus.REJECTED) {
      // Remove from student's enrolled courses if rejected and somehow it was there (edge case)
      const currentRegistrations = mockStudentCourseRegistrations.get(application.studentId) || [];
      const updatedRegistrations = currentRegistrations.filter(reg => reg.course.id !== application.course.id);
      mockStudentCourseRegistrations.set(application.studentId, updatedRegistrations);
    }

    application.status = payload.status;
    mockCourseApplications.set(payload.applicationId, application); // Update the map
    console.log(`Application ${payload.applicationId} for ${application.course.name} by student ${application.studentId} ${payload.status}.`);
  },

  /**
   * Simulates fetching data for the Faculty Dashboard.
   * @param facultyId - The ID of the faculty user.
   * @returns A promise that resolves with FacultyDashboardData.
   */
  async fetchFacultyDashboardData(facultyId: string): Promise<FacultyDashboardData> {
    await delay(1000);

    const assignedCourses = mockCourses.filter(course => course.facultyId === facultyId);

    const coursesWithStudents = assignedCourses.map(course => {
      const studentsInCourse: (User & { enrolledExams: EnrolledExam[] })[] = [];

      // Iterate through all students to find who is registered for this course
      mockUsers.forEach(student => {
        if (student.role === UserRole.STUDENT) {
          const studentRegisteredCourses = mockStudentCourseRegistrations.get(student.id) || [];
          if (studentRegisteredCourses.some(reg => reg.course.id === course.id)) {
            // Get exams enrolled by this student for this specific course
            const studentEnrolledExams = (mockStudentExamEnrollments.get(student.id) || [])
                                         .filter(enroll => enroll.course.id === course.id);

            studentsInCourse.push({
              ...student,
              enrolledExams: studentEnrolledExams,
            });
          }
        }
      });
      return { ...course, students: studentsInCourse };
    });

    return { assignedCourses: coursesWithStudents };
  },

  /**
   * Simulates fetching data for the Admin Dashboard.
   * @returns A promise that resolves with AdminDashboardData.
   */
  async fetchAdminDashboardData(): Promise<AdminDashboardData> {
    await delay(1000);
    const pendingCourseApplications = Array.from(mockCourseApplications.values())
                                          .filter(app => app.status === CourseApplicationStatus.PENDING);
    return {
      pendingCourseApplications: pendingCourseApplications,
      allUsers: [...mockUsers],
      allCourses: [...mockCourses],
      allExams: [...mockExams],
    };
  },

  /**
   * Simulates adding a new course (Admin action).
   */
  async addCourse(payload: AddCoursePayload): Promise<Course> {
    await delay(1000);
    const newCourse: Course = {
      id: `c${++nextCourseId}`,
      name: payload.name,
      code: payload.code,
      description: payload.description,
      credits: payload.credits,
      facultyId: payload.facultyId || undefined,
    };
    mockCourses.push(newCourse);
    console.log('Added new course:', newCourse);
    return { ...newCourse };
  },

  /**
   * Simulates adding a new exam (Admin action).
   */
  async addExam(payload: AddExamPayload): Promise<Exam> {
    await delay(1000);
    const newExam: Exam = {
      id: `e${++nextExamId}`,
      courseId: payload.courseId,
      name: payload.name,
      date: payload.date,
      time: payload.time,
      location: payload.location,
    };
    mockExams.push(newExam);
    console.log('Added new exam:', newExam);
    return { ...newExam };
  },

  // Expose network service functions for conceptual logging/monitoring
  getNetworkLogs: networkService.getNetworkLogs,
};