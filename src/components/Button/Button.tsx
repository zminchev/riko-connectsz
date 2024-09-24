import React from "react";

interface ButtonProps {
  type?: HTMLButtonElement["type"];
  text: string;
  className?: string;
  onClick: () => void;
}

const Button = ({ type, text = "", className = "", onClick }: ButtonProps) => {
  return (
    <button type={type} className={className} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
