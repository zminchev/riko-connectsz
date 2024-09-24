import React, { forwardRef } from "react";

interface InputProps {
  id: string;
  type: string;
  value: string;
  className?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { id, type, value, className = "", placeholder = "", onChange }: InputProps,
    ref
  ) => {
    return (
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        className={`text-black p-2 rounded-sm focus:outline-none ${className}`}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  }
);

export default Input;
