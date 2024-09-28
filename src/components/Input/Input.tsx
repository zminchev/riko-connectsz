import React, { forwardRef } from 'react';

interface InputProps {
  id: string;
  type: string;
  value: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      type,
      value,
      className = '',
      placeholder = '',
      disabled = false,
      onChange,
    }: InputProps,
    ref,
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        className={`text-black p-2 rounded-sm focus:outline-none disabled:text-gray-400 ${className}`}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        onChange={onChange}
      />
    );
  },
);

export default Input;

Input.displayName = 'Input';
