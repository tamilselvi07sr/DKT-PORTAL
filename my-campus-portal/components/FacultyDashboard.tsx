// components/FacultyDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { User, AppState, FacultyDashboardData } from '../types';
import Button from './Button';

interface FacultyDashboardProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ currentUser, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacultyDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchFacultyDashboardData(currentUser.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch faculty dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchFacultyDashboardData();
  }, [fetchFacultyDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-blue-700">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading faculty dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center bg-red-100 rounded-md m-4">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button onClick={fetchFacultyDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Faculty Dashboard</h2>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Section title="My Assigned Courses">
          {dashboardData?.assignedCourses.length === 0 ? (
            <p className="text-gray-600">No courses assigned to you.</p>
          ) : (
            <div className="space-y-6">
              {dashboardData?.assignedCourses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-700 mb-4">{course.name} ({course.code}) - {course.credits} Credits</h3>
                  <p className="text-gray-700 mb-4">{course.description}</p>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Enrolled Students:</h4>
                  {course.students.length === 0 ? (
                    <p className="text-gray-600 ml-4">No students currently enrolled in this course.</p>
                  ) : (
                    <ul className="space-y-4 pl-4 border-l border-gray-200">
                      {course.students.map(student => (
                        <li key={student.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                          <p className="font-medium text-gray-800">{student.name} ({student.registrationId})</p>
                          <p className="text-sm text-gray-600">Email: {student.email}</p>

                          <h5 className="text-md font-semibold text-gray-700 mt-2 mb-1">Enrolled Exams:</h5>
                          {student.enrolledExams.length === 0 ? (
                            <p className="text-xs text-gray-500 ml-2">No exams enrolled for this course.</p>
                          ) : (
                            <ul className="space-y-1 ml-2 text-sm text-gray-600">
                              {student.enrolledExams.map(examEnrollment => (
                                <li key={examEnrollment.exam.id}>
                                  - {examEnrollment.exam.name} on {examEnrollment.exam.date} at {examEnrollment.exam.time} ({examEnrollment.exam.location})
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
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

export default FacultyDashboard;