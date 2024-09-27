import React from "react";

const Card = ({
  children,
  className = "",
  isRounded = false,
}: {
  children: React.ReactNode;
  className?: string;
  isRounded?: boolean;
}) => {
  return (
    <div className={`${className} shadow-md border border-gray-300/50`}>
      {children}
    </div>
  );
};

export default Card;
