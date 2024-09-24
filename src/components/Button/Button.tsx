import React from "react";

interface ButtonProps {
  type?: HTMLButtonElement["type"];
  text?: string;
  className?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const Button = ({
  type,
  text = "",
  className = "",
  icon,
  onClick,
}: ButtonProps) => {
  return (
    <button type={type} className={className} onClick={onClick}>
      {text || icon}
    </button>
  );
};

export default Button;
