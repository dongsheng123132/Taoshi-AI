import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 w-full border-b border-gray-700/50">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
          淘视 Taoshi AI
        </h1>
        <p className="text-gray-400 mt-1">Your Visual Product Scout</p>
      </div>
    </header>
  );
};

export default Header;