import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  colSpan = 1,
  ...props 
}) => {
  const baseClasses = "px-4 py-3 font-semibold text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95";
  const spanClasses = colSpan > 1 ? `col-span-${colSpan}` : '';
  
  return (
    <button
      className={`${baseClasses} ${spanClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
