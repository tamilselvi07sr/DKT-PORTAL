// components/AdminDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { User, AppState, AdminDashboardData, CourseApplication, CourseApplicationStatus, AddCoursePayload, AddExamPayload, UserRole } from '../types';
import Button from './Button';
import Input from './Input';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);

  const [newCourse, setNewCourse] = useState<AddCoursePayload>({
    name: '', code: '', description: '', credits: 3, facultyId: '',
  });
  const [newExam, setNewExam] = useState<AddExamPayload>({
    courseId: '', name: '', date: '', time: '', location: '',
  });
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addExamLoading, setAddExamLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState<string | null>(null);
  const [addExamError, setAddExamError] = useState<string | null>(null);
  const [addCourseSuccess, setAddCourseSuccess] = useState<string | null>(null);
  const [addExamSuccess, setAddExamSuccess] = useState<string | null>(null);


  const fetchAdminDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchAdminDashboardData();
      setDashboardData(data);
      setNetworkLogs(apiService.getNetworkLogs()); // Fetch conceptual network logs
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminDashboardData();
  }, [fetchAdminDashboardData]);

  const handleApplicationStatusUpdate = useCallback(async (applicationId: string, status: CourseApplicationStatus) => {
    try {
      await apiService.updateCourseApplicationStatus({ applicationId, status });
      // Refresh data after update
      fetchAdminDashboardData();
    } catch (err: any) {
      alert(`Failed to update application status: ${err.message}`);
    }
  }, [fetchAdminDashboardData]);

  const handleAddCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [id]: id === 'credits' ? parseInt(value) || 0 : value }));
  };

  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCourseLoading(true);
    setAddCourseError(null);
    setAddCourseSuccess(null);
    try {
      await apiService.addCourse(newCourse);
      setAddCourseSuccess('Course added successfully!');
      setNewCourse({ name: '', code: '', description: '', credits: 3, facultyId: '' });
      fetchAdminDashboardData(); // Refresh data
    } catch (err: any) {
      setAddCourseError(err.message || 'Failed to add course.');
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleAddExamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewExam((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddExamLoading(true);
    setAddExamError(null);
    setAddExamSuccess(null);
    try {
      await apiService.addExam(newExam);
      setAddExamSuccess('Exam added successfully!');
      setNewExam({ courseId: '', name: '', date: '', time: '', location: '' });
      fetchAdminDashboardData(); // Refresh data
    } catch (err: any) {
      setAddExamError(err.message || 'Failed to add exam.');
    } finally {
      setAddExamLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-blue-700">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center bg-red-100 rounded-md m-4">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button onClick={fetchAdminDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const facultyUsers = dashboardData?.allUsers.filter(u => u.role === UserRole.FACULTY) || [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <Section title="Pending Course Applications">
          {dashboardData?.pendingCourseApplications.length === 0 ? (
            <p className="text-gray-600">No pending course applications.</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData?.pendingCourseApplications.map((app: CourseApplication) => (
                <li key={app.id} className="p-4 bg-yellow-50 rounded-md shadow-sm border border-yellow-200">
                  <p className="text-lg font-semibold text-gray-800">{app.course.name} ({app.course.code})</p>
                  <p className="text-gray-700 text-sm">Student ID: {app.studentId}</p>
                  <p className="text-gray-700 text-sm">Applied on: {app.applicationDate}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplicationStatusUpdate(app.id, CourseApplicationStatus.APPROVED)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleApplicationStatusUpdate(app.id, CourseApplicationStatus.REJECTED)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="User Management (Conceptual)">
          <p className="text-gray-600 mb-4">Displaying all registered users. In a real system, you'd have more extensive CRUD operations here.</p>
          <div className="max-h-80 overflow-y-auto">
            <ul className="space-y-2">
              {dashboardData?.allUsers.map(user => (
                <li key={user.id} className="p-3 bg-blue-50 rounded-md shadow-sm">
                  <p className="font-medium">{user.name} ({user.registrationId})</p>
                  <p className="text-sm text-gray-700">Role: {user.role} | Email: {user.email}</p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="Network Status (Simulation)">
          <p className="text-gray-600 mb-4">Simulated backend network activity logs for P2P, Subnetting, and NAT. </p>
          <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-xs max-h-80 overflow-y-auto">
            {networkLogs.length === 0 ? (
              <p>No network activity logged.</p>
            ) : (
              networkLogs.map((log, index) => (
                <p key={index}>{log}</p>
              ))
            )}
          </div>
        </Section>

        <Section title="Add New Course">
          <form onSubmit={handleAddCourseSubmit} className="space-y-4">
            <Input label="Course Name" id="name" value={newCourse.name} onChange={handleAddCourseChange} required />
            <Input label="Course Code" id="code" value={newCourse.code} onChange={handleAddCourseChange} required />
            <Input label="Description" id="description" value={newCourse.description} onChange={handleAddCourseChange} required />
            <Input label="Credits" id="credits" type="number" value={newCourse.credits} onChange={handleAddCourseChange} required min="1" />
            <Input
              label="Faculty ID (Optional, e.g., F-0001)"
              id="facultyId"
              value={newCourse.facultyId}
              onChange={handleAddCourseChange}
              placeholder="Assign to a faculty"
            />
            <Button type="submit" loading={addCourseLoading} className="w-full">
              Add Course
            </Button>
            {addCourseSuccess && <p className="text-green-600 text-sm mt-2">{addCourseSuccess}</p>}
            {addCourseError && <p className="text-red-600 text-sm mt-2">{addCourseError}</p>}
          </form>
        </Section>

        <Section title="Add New Exam">
          <form onSubmit={handleAddExamSubmit} className="space-y-4">
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
              Select Course
            </label>
            <select
              id="courseId"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newExam.courseId}
              onChange={handleAddExamChange}
              required
            >
              <option value="">-- Select a Course --</option>
              {dashboardData?.allCourses.map(course => (
                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
              ))}
            </select>
            <Input label="Exam Name" id="name" value={newExam.name} onChange={handleAddExamChange} required />
            <Input label="Date" id="date" type="date" value={newExam.date} onChange={handleAddExamChange} required />
            <Input label="Time" id="time" type="time" value={newExam.time} onChange={handleAddExamChange} required />
            <Input label="Location" id="location" value={newExam.location} onChange={handleAddExamChange} required />
            <Button type="submit" loading={addExamLoading} className="w-full">
              Add Exam
            </Button>
            {addExamSuccess && <p className="text-green-600 text-sm mt-2">{addExamSuccess}</p>}
            {addExamError && <p className="text-red-600 text-sm mt-2">{addExamError}</p>}
          </form>
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
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h3 className="text-2xl font-semibold text-blue-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default AdminDashboard;