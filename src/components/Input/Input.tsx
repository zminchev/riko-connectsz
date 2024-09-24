import React from "react";

interface InputProps {
  id: string;
  type: string;
  value: string;
  className?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({
  id,
  type,
  value,
  className = "",
  placeholder = "",
  onChange,
}: InputProps) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      className={`text-black p-2 rounded-sm focus:outline-none ${className}`}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

export default Input;
