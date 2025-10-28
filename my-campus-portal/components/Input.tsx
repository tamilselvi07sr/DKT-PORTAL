// components/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  // Removed pattern?: RegExp; to avoid type conflict with React.InputHTMLAttributes<HTMLInputElement>
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  error,
  // Removed pattern from destructuring as it's no longer in InputProps
  className = '',
  onChange,
  onBlur,
  value,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  };

  const inputClasses = `
    mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={inputClasses}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;