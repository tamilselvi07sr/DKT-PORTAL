// components/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { User, StudentDashboardData, EnrolledCourse, EnrolledExam, AppState, CourseApplication, CourseApplicationStatus } from '../types';
import Button from './Button';

interface DashboardProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchStudentDashboardData(currentUser.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-blue-700">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center bg-red-100 rounded-md m-4">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Section title="My Course Applications">
          {dashboardData?.courseApplications.length === 0 ? (
            <p className="text-gray-600">No course applications submitted yet. <span className="underline cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => onNavigate(AppState.COURSE_REGISTRATION)}>Apply for courses</span>.</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData?.courseApplications.map((app: CourseApplication) => (
                <li key={app.id} className="p-4 bg-gray-50 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{app.course.name} ({app.course.code})</h3>
                  <p className="text-gray-600 text-sm">Application Date: {app.applicationDate}</p>
                  <p className={`text-sm font-medium ${app.status === CourseApplicationStatus.APPROVED ? 'text-green-600' :
                                                  app.status === CourseApplicationStatus.REJECTED ? 'text-red-600' :
                                                  'text-yellow-600'}`}>
                    Status: {app.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Enrolled Courses">
          {dashboardData?.enrolledCourses.length === 0 ? (
            <p className="text-gray-600">No courses currently enrolled. <span className="underline cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => onNavigate(AppState.COURSE_REGISTRATION)}>Apply for courses</span>.</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData?.enrolledCourses.map((item: EnrolledCourse) => (
                <li key={item.course.id} className="p-4 bg-gray-50 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{item.course.name} ({item.course.code})</h3>
                  <p className="text-gray-600 text-sm">Credits: {item.course.credits}</p>
                  <p className="text-gray-500 text-xs">Registered on: {item.registrationDate}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Enrolled Exams">
          {dashboardData?.enrolledExams.length === 0 ? (
            <p className="text-gray-600">No exams enrolled yet. <span className="underline cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => onNavigate(AppState.EXAM_ENROLLMENT)}>Enroll in exams</span>.</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData?.enrolledExams.map((item: EnrolledExam) => (
                <li key={item.exam.id} className="p-4 bg-gray-50 rounded-md shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{item.exam.name}</h3>
                  <p className="text-gray-600 text-sm">Course: {item.course.code}</p>
                  <p className="text-gray-600 text-sm">Date: {item.exam.date} at {item.exam.time}</p>
                  <p className="text-gray-600 text-sm">Location: {item.exam.location}</p>
                  <p className="text-gray-500 text-xs">Enrolled on: {item.enrollmentDate}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-blue-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default Dashboard;