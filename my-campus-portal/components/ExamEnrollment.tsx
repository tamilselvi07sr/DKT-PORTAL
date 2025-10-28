// components/ExamEnrollment.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { User, Exam, AppState } from '../types';
import Button from './Button';

interface ExamEnrollmentProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
}

const ExamEnrollment: React.FC<ExamEnrollmentProps> = ({ currentUser, onNavigate }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [enrollmentMessage, setEnrollmentMessage] = useState<{ [key: string]: string }>({});

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedExams = await apiService.fetchAvailableExams();
      setExams(fetchedExams);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnroll = useCallback(async (examId: string) => {
    setEnrollmentStatus((prev) => ({ ...prev, [examId]: 'loading' }));
    setEnrollmentMessage((prev) => ({ ...prev, [examId]: '' }));
    try {
      await apiService.enrollInExam({ studentId: currentUser.id, examId });
      setEnrollmentStatus((prev) => ({ ...prev, [examId]: 'success' }));
      setEnrollmentMessage((prev) => ({ ...prev, [examId]: 'Enrolled successfully!' }));
    } catch (err: any) {
      setEnrollmentStatus((prev) => ({ ...prev, [examId]: 'error' }));
      setEnrollmentMessage((prev) => ({ ...prev, [examId]: err.message || 'Enrollment failed.' }));
    }
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-blue-700">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading available exams...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center bg-red-100 rounded-md m-4">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button onClick={fetchExams} className="mt-4">
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
        <h2 className="text-3xl font-bold text-gray-800">Exam Enrollment</h2>
        <Button variant="secondary" onClick={() => onNavigate(AppState.DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>

      {exams.length === 0 ? (
        <p className="text-gray-600 text-center text-lg mt-8">No exams currently available for enrollment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{exam.name}</h3>
              <p className="text-gray-700 mb-1">Course ID: {exam.courseId}</p>
              <p className="text-gray-600 text-sm mb-1">Date: {exam.date}</p>
              <p className="text-gray-600 text-sm mb-1">Time: {exam.time}</p>
              <p className="text-gray-600 text-sm mb-4">Location: {exam.location}</p>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleEnroll(exam.id)}
                  loading={enrollmentStatus[exam.id] === 'loading'}
                  disabled={enrollmentStatus[exam.id] === 'success'}
                  size="sm"
                >
                  {enrollmentStatus[exam.id] === 'success' ? 'Enrolled' : 'Enroll'}
                </Button>
                {enrollmentStatus[exam.id] === 'success' && (
                  <span className="text-green-600 text-sm font-medium ml-2">✓ {enrollmentMessage[exam.id]}</span>
                )}
                {enrollmentStatus[exam.id] === 'error' && (
                  <span className="text-red-600 text-sm font-medium ml-2">✗ {enrollmentMessage[exam.id]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamEnrollment;