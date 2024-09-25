import React from "react";

interface ButtonProps {
  type?: HTMLButtonElement["type"];
  text?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  type,
  text = "",
  className = "",
  icon,
  disabled = false,
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {text || icon}
    </button>
  );
};

export default Button;
