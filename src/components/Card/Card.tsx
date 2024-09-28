import React from "react";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  isRounded?: boolean;
}) => {
  return (
    <div className={`shadow-md border border-gray-300/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
