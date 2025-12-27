import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'medium', fullScreen = false, message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-t-4 border-eco-main ${sizeClasses[size]}`}
      ></div>
      {message && <p className="text-gray-600 font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-eco-light">
        {loaderContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{loaderContent}</div>;
};

export default Loader;