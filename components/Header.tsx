
import React from 'react';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 bg-gray-900/50 backdrop-blur-sm z-10 flex justify-between items-center border-b border-gray-800">
      <div className="flex items-center">
        <i className="fas fa-film text-2xl text-purple-400 mr-3"></i>
        <h1 className="text-2xl font-bold tracking-wider">
          Genlux <span className="text-purple-400">AI</span>
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
            <p className="text-sm font-semibold">Free Tier</p>
            <p className="text-xs text-gray-400">3/5 generations left</p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-4 py-2 rounded-md text-sm hover:opacity-90 transition-opacity">
          Go Pro
        </button>
        <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-sign-out-alt text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
