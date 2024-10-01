import React from 'react';

const Card = ({
  children,
  className = '',
  containerRef,
  onScroll,
}: {
  children: React.ReactNode;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
}) => {
  return (
    <div
      className={`shadow-md border border-gray-300/50 ${className}`}
      ref={containerRef}
      onScroll={onScroll}
    >
      {children}
    </div>
  );
};

export default Card;
