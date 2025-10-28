// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, AppState, UserRole } from './types';
import AuthForm from './components/AuthForm';
import SignupForm from './components/SignupForm';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import CourseRegistration from './components/CourseRegistration';
import ExamEnrollment from './components/ExamEnrollment';
// Import Button component
import Button from './components/Button';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);


  // Simulate checking for a logged-in user on initial load
  useEffect(() => {
    // In a real app, you'd check a token in localStorage or a session.
    // For this mock, we start in LOGIN state.
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setGlobalError(null);
    setSignupSuccessMessage(null); // Clear any signup messages

    // Determine initial dashboard based on user role
    switch (user.role) {
      case UserRole.STUDENT:
        setAppState(AppState.DASHBOARD);
        break;
      case UserRole.FACULTY:
        setAppState(AppState.FACULTY_DASHBOARD);
        break;
      case UserRole.ADMIN:
        setAppState(AppState.ADMIN_DASHBOARD);
        break;
      default:
        setAppState(AppState.ERROR); // Fallback for unknown roles
        setGlobalError('Unsupported user role. Please contact support.');
        break;
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAppState(AppState.LOGIN);
    setGlobalError(null);
    setSignupSuccessMessage(null);
  }, []);

  const handleNavigate = useCallback((newState: AppState) => {
    // Ensure navigation only happens if authenticated (except for login/signup)
    if (newState === AppState.LOGIN || newState === AppState.SIGNUP || currentUser) {
      setAppState(newState);
      setGlobalError(null);
    } else {
      setAppState(AppState.LOGIN); // Redirect to login if not authenticated
    }
  }, [currentUser]);

  const handleSignupSuccess = useCallback(() => {
    setSignupSuccessMessage('Account created successfully! Please log in.');
  }, []);

  const renderContent = useCallback(() => {
    // Global error takes precedence
    if (globalError) {
      return (
        <div className="container mx-auto p-4 mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <h2 className="text-xl font-bold mb-2">Application Error</h2>
          <p>{globalError}</p>
          <button
            onClick={() => setGlobalError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Error
          </button>
        </div>
      );
    }

    // Display signup success message at login
    if (appState === AppState.LOGIN && signupSuccessMessage) {
      return (
        <>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-auto w-full max-w-md mt-8" role="alert">
            <span className="block sm:inline">{signupSuccessMessage}</span>
          </div>
          <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        </>
      );
    }

    switch (appState) {
      case AppState.LOGIN:
        return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      case AppState.SIGNUP:
        return <SignupForm onSignupSuccess={handleSignupSuccess} onNavigate={handleNavigate} />;
      case AppState.DASHBOARD:
        if (!currentUser) return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppState.ADMIN_DASHBOARD:
        if (!currentUser || currentUser.role !== UserRole.ADMIN) return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppState.FACULTY_DASHBOARD:
        if (!currentUser || currentUser.role !== UserRole.FACULTY) return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <FacultyDashboard currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppState.COURSE_REGISTRATION:
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <CourseRegistration currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppState.EXAM_ENROLLMENT:
        if (!currentUser || currentUser.role !== UserRole.STUDENT) return <AuthForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        return <ExamEnrollment currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppState.ERROR:
        // This state is primarily handled by the globalError message display above
        return null;
      default:
        return (
          <div className="container mx-auto p-4 mt-8 text-center text-lg text-red-500">
            Unknown application state. Please refresh or contact support.
            <Button onClick={() => handleNavigate(AppState.LOGIN)} className="mt-4 block mx-auto">
              Go to Login
            </Button>
          </div>
        );
    }
  }, [appState, currentUser, globalError, signupSuccessMessage, handleLoginSuccess, handleNavigate, handleSignupSuccess]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {currentUser && (
        <Navbar
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <main className="flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        &copy; {new Date().getFullYear()} Campus Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default App;