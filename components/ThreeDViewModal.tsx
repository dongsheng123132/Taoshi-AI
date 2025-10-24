import React, { useState, useEffect } from 'react';

interface ThreeDViewModalProps {
  productName: string;
  isLoading: boolean;
  imageData: string | null;
  error: string | null;
  onClose: () => void;
}

const ThreeDViewModal: React.FC<ThreeDViewModalProps> = ({
  productName,
  isLoading,
  imageData,
  error,
  onClose,
}) => {
  const loadingMessages = [
    "Warming up the AI's creative circuits...",
    `Imagining new angles for ${productName}...`,
    "Rendering a fresh perspective...",
    "Applying the finishing touches..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setCurrentMessageIndex(0); // Reset on new load
      const intervalId = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 3500); // Change message every 3.5 seconds

      return () => clearInterval(intervalId);
    }
  }, [isLoading, productName]);


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-cyan-400 truncate">
            AI Perspective: <span className="text-white">{productName}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 flex-grow flex items-center justify-center overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
              <p className="text-lg text-purple-300 font-semibold">{loadingMessages[currentMessageIndex]}</p>
              <p className="text-sm text-gray-400">This may take up to a minute.</p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
              <p className="text-red-300 mt-2">{error}</p>
            </div>
          )}

          {imageData && !isLoading && (
            <img 
              src={`data:image/jpeg;base64,${imageData}`} 
              alt={`AI-generated view of ${productName}`} 
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewModal;