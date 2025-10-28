// components/SignupForm.tsx
import React, { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { SignupCredentials, AppState } from '../types';
// Fix: Use relative import path for constants
import { REGISTRATION_ID_REGEX, EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../constants';
import Input from './Input';
import Button from './Button';

interface SignupFormProps {
  onSignupSuccess: () => void;
  onNavigate: (state: AppState) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, onNavigate }) => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    registrationId: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    registrationId?: string;
    email?: string;
    password?: string;
    api?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = useCallback(() => {
    const newErrors: typeof errors = {};
    if (!credentials.name || credentials.name.trim() === '') {
      newErrors.name = 'Name is required.';
    }
    if (!credentials.registrationId) {
      newErrors.registrationId = 'Registration ID is required.';
    } else if (!REGISTRATION_ID_REGEX.test(credentials.registrationId)) {
      newErrors.registrationId = 'Invalid format. Expected S-XXXX.';
    }
    if (!credentials.email) {
      newErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(credentials.email)) {
      newErrors.email = 'Invalid email format.';
    }
    if (!credentials.password) {
      newErrors.password = 'Password is required.';
    } else if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [credentials]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined, api: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validate();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await apiService.registerUser(credentials);
      onSignupSuccess();
      onNavigate(AppState.LOGIN); // Redirect to login after successful signup
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, api: error.message || 'Sign up failed. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create New Student Account</h2>
        {errors.api && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errors.api}</span>
          </div>
        )}
        <Input
          label="Full Name"
          id="name"
          type="text"
          value={credentials.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          required
        />
        <Input
          label="Registration ID (e.g., S-0001)"
          id="registrationId"
          type="text"
          value={credentials.registrationId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.registrationId}
          // Fix: Convert RegExp to string for the pattern prop
          pattern={REGISTRATION_ID_REGEX.source}
          required
        />
        <Input
          label="Email Address"
          id="email"
          type="email"
          value={credentials.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          // Fix: Convert RegExp to string for the pattern prop
          pattern={EMAIL_REGEX.source}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          required
        />
        <Button type="submit" loading={loading} className="w-full mt-4">
          Sign Up
        </Button>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate(AppState.LOGIN)}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;