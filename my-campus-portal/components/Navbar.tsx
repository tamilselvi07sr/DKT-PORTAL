// components/Navbar.tsx
import React from 'react';
import { AppState, User, UserRole } from '../types';
import Button from './Button';

interface NavbarProps {
  currentUser: User;
  onNavigate: (state: AppState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onNavigate, onLogout }) => {
  return (
    <nav className="bg-blue-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-xl font-bold">Campus Portal</h1>
          <span className="text-blue-200">Welcome, {currentUser.name} ({currentUser.registrationId})</span>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {currentUser.role === UserRole.STUDENT && (
            <>
              <Button variant="secondary" size="sm" onClick={() => onNavigate(AppState.DASHBOARD)}>
                My Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate(AppState.COURSE_REGISTRATION)}>
                Course Application
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate(AppState.EXAM_ENROLLMENT)}>
                Exam Enrollment
              </Button>
            </>
          )}
          {currentUser.role === UserRole.FACULTY && (
            <Button variant="secondary" size="sm" onClick={() => onNavigate(AppState.FACULTY_DASHBOARD)}>
              Faculty Dashboard
            </Button>
          )}
          {currentUser.role === UserRole.ADMIN && (
            <Button variant="secondary" size="sm" onClick={() => onNavigate(AppState.ADMIN_DASHBOARD)}>
              Admin Dashboard
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;