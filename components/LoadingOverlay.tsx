
import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Warming up the pixels...",
    "Composing your cinematic masterpiece...",
    "Teaching AI about cinematography...",
    "Rendering the digital dreamscape...",
    "Assembling frames with creative flair...",
    "Polishing the final cut...",
    "Almost there, the premiere is near!"
];

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const [dynamicMessage, setDynamicMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDynamicMessage(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
      <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin mb-6"></div>
      <p className="text-lg font-semibold text-gray-200 mb-2">{message}</p>
      <p className="text-md text-gray-400">{dynamicMessage}</p>
    </div>
  );
};

export default LoadingOverlay;
