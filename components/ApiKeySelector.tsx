import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

// @ts-ignore
const isAistudioAvailable = window.aistudio && typeof window.aistudio.openSelectKey === 'function';

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (!isAistudioAvailable) return;
    try {
      // @ts-ignore - aistudio is available in the execution environment
      await window.aistudio.openSelectKey();
      onKeySelected();
    } catch (error) {
      console.error("Error opening API key selection dialog:", error);
    }
  };

  if (!isAistudioAvailable) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-lg mx-auto border border-yellow-500/50">
          <div className="text-yellow-400 mb-4">
              <i className="fas fa-info-circle text-5xl"></i>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Unsupported Environment</h2>
          <p className="text-gray-400 mb-6">
            The video generation feature requires a specific environment (like Google AI Studio) to securely select an API key. This capability doesn't seem to be available right now.
          </p>
          <p className="text-gray-500 text-sm">
            To enable video generation, please run this application within the Google AI Studio environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-lg mx-auto border border-gray-700">
        <div className="text-purple-400 mb-4">
            <i className="fas fa-key text-5xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">API Key Required for Veo</h2>
        <p className="text-gray-400 mb-6">
          To use Genlux AI's video generation capabilities, you need to select an API key from a project with the Gemini API enabled.
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          Please note that charges may apply to your Google Cloud project. For more details, visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Gemini API billing documentation
          </a>.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Select Your API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeySelector;
