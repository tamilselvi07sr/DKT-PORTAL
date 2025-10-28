// constants.ts

export const REGISTRATION_ID_REGEX = /^S-\d{4}$/; // Example: S-1234 for student
export const FACULTY_ID_REGEX = /^F-\d{4}$/; // Example: F-1234 for faculty
export const ADMIN_ID_REGEX = /^A-\d{4}$/; // Example: A-1234 for admin

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const API_BASE_URL = '/api'; // Mocked base URL
export const MIN_PASSWORD_LENGTH = 6;

export enum CourseApplicationStatusStrings {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}