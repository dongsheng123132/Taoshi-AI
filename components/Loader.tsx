import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  const defaultMessage = "AI is analyzing your media...";
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
       <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
       <p className="text-lg text-cyan-300 font-semibold">{message || defaultMessage}</p>
       <p className="text-sm text-gray-400">This may take a moment.</p>
    </div>
  );
};

export default Loader;