import React from 'react';

interface WelcomeScreenProps {
  children: React.ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ children }) => {
  return (
    <div className="text-center p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-4">Welcome to Taoshi AI</h2>
      <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
        Spotted a product in a video? Upload a file or use your camera. Let our AI scout it out for you.
      </p>
      {children}
    </div>
  );
};

export default WelcomeScreen;