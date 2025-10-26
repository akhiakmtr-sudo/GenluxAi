import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full m-4 border border-purple-500/50 text-center p-8 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-purple-400 mb-4">
          <i className="fas fa-rocket text-5xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">Upgrade to Pro</h2>
        <p className="text-gray-400 mb-6">
          You've used all your free generations. Upgrade to Genlux AI Pro to unlock unlimited video creations and more!
        </p>
        
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <ul className="space-y-2 text-gray-300">
                <li className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-3"></i>Unlimited Video Generations</li>
                <li className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-3"></i>Priority Access to New Features</li>
                <li className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-3"></i>Dedicated Support</li>
            </ul>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Upgrade for ₹199/month
        </button>
         <button
          onClick={onClose}
          className="w-full mt-3 text-gray-400 hover:text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
