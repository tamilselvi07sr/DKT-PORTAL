// components/CourseRegistration.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { User, Course, AppState, CourseApplicationStatus } from '../types';
import Button from './Button';

interface CourseRegistrationProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
}

const CourseRegistration: React.FC<CourseRegistrationProps> = ({ currentUser, onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [applicationMessage, setApplicationMessage] = useState<{ [key: string]: string }>({});

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCourses = await apiService.fetchCourses();
      setCourses(fetchedCourses);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleApply = useCallback(async (courseId: string) => {
    setApplicationStatus((prev) => ({ ...prev, [courseId]: 'loading' }));
    setApplicationMessage((prev) => ({ ...prev, [courseId]: '' }));
    try {
      await apiService.submitCourseApplication({ studentId: currentUser.id, courseId });
      setApplicationStatus((prev) => ({ ...prev, [courseId]: 'success' }));
      setApplicationMessage((prev) => ({ ...prev, [courseId]: 'Application submitted (Pending Admin approval).' }));
    } catch (err: any) {
      setApplicationStatus((prev) => ({ ...prev, [courseId]: 'error' }));
      setApplicationMessage((prev) => ({ ...prev, [courseId]: err.message || 'Application failed.' }));
    }
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-blue-700">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading available courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center bg-red-100 rounded-md m-4">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button onClick={fetchCourses} className="mt-4">
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => onNavigate(AppState.DASHBOARD)} className="ml-2 mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Course Application</h2>
        <Button variant="secondary" onClick={() => onNavigate(AppState.DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-600 text-center text-lg mt-8">No courses currently available for application.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{course.name} ({course.code})</h3>
              <p className="text-gray-700 mb-3">{course.description}</p>
              <p className="text-gray-600 text-sm mb-4">Credits: {course.credits}</p>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleApply(course.id)}
                  loading={applicationStatus[course.id] === 'loading'}
                  disabled={applicationStatus[course.id] === 'success'}
                  size="sm"
                >
                  {applicationStatus[course.id] === 'success' ? 'Applied' : 'Apply'}
                </Button>
                {applicationStatus[course.id] === 'success' && (
                  <span className="text-green-600 text-sm font-medium ml-2">✓ {applicationMessage[course.id]}</span>
                )}
                {applicationStatus[course.id] === 'error' && (
                  <span className="text-red-600 text-sm font-medium ml-2">✗ {applicationMessage[course.id]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseRegistration;