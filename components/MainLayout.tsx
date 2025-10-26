
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { AspectRatio, HistoryItem, VideoLength, VideoGenerationState } from '../types';
import Header from './Header';
import HistoryPanel from './HistoryPanel';
import LoadingOverlay from './LoadingOverlay';

const MainLayout: React.FC<{ onLogout: () => void; onApiKeyInvalid: () => void; }> = ({ onLogout, onApiKeyInvalid }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [videoLength, setVideoLength] = useState<VideoLength>(VideoLength.SHORT);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [generationState, setGenerationState] = useState<VideoGenerationState>({
    status: 'idle',
    message: '',
    videoUrl: null,
    error: null,
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('genluxAiHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleProgress = (message: string) => {
    setGenerationState(prevState => ({ ...prevState, message }));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerationState({
      status: 'generating',
      message: 'Preparing generation...',
      videoUrl: null,
      error: null
    });

    try {
      const url = await generateVideo(prompt, aspectRatio, videoLength, handleProgress);
      
      const newItem: HistoryItem = {
        id: new Date().toISOString(),
        prompt,
        videoUrl: url,
        aspectRatio,
        videoLength,
        timestamp: new Date().toLocaleString(),
      };

      const updatedHistory = [...history, newItem];
      setHistory(updatedHistory);
      localStorage.setItem('genluxAiHistory', JSON.stringify(updatedHistory));

      setGenerationState({ status: 'success', message: 'Video generated!', videoUrl: url, error: null });
    } catch (err) {
      const error = err as Error;
      if (error.message === "API_KEY_INVALID") {
        onApiKeyInvalid();
        return;
      }
      setGenerationState({ status: 'error', message: 'Generation failed', videoUrl: null, error: error.message });
    }
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setAspectRatio(item.aspectRatio);
    setVideoLength(item.videoLength);
    setGenerationState({ status: 'success', message: 'Loaded from history', videoUrl: item.videoUrl, error: null });
  };
  
  const isLoading = generationState.status !== 'idle' && generationState.status !== 'success' && generationState.status !== 'error';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white pt-20 md:pt-0">
      <Header onLogout={onLogout} />
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col h-full">
            {/* Video Player Area */}
            <div className="flex-grow flex items-center justify-center mb-6">
                <div 
                    className={`w-full bg-black rounded-lg shadow-2xl border border-gray-700 relative overflow-hidden transition-all duration-300 ${aspectRatio === AspectRatio.LANDSCAPE ? 'aspect-video' : 'aspect-[9/16] max-h-[70vh]'}`}
                >
                    {isLoading && <LoadingOverlay message={generationState.message} />}
                    {generationState.videoUrl && (
                        <video src={generationState.videoUrl} controls autoPlay loop className="w-full h-full object-contain"></video>
                    )}
                    {!isLoading && !generationState.videoUrl && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                             <i className="fas fa-video text-5xl mb-4"></i>
                             <p>Your generated video will appear here.</p>
                        </div>
                    )}
                    {generationState.status === 'error' && (
                        <div className="absolute inset-0 bg-red-900/50 flex flex-col items-center justify-center text-center p-4">
                            <i className="fas fa-exclamation-triangle text-3xl text-red-300 mb-3"></i>
                            <p className="font-semibold text-red-200">Generation Failed</p>
                            <p className="text-sm text-red-300 max-w-md">{generationState.error}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic shot of a robot surfing on a wave of liquid data"
                        className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-24 md:h-auto resize-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic mr-2"></i>}
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                    {/* Aspect Ratio */}
                    <div>
                        <span className="text-sm font-medium mr-3 text-gray-300">Aspect Ratio</span>
                        <div className="inline-flex rounded-md shadow-sm bg-gray-700">
                            <button onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)} disabled={isLoading} className={`px-4 py-2 text-sm font-medium border border-gray-600 rounded-l-lg ${aspectRatio === AspectRatio.LANDSCAPE ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}>16:9</button>
                            <button onClick={() => setAspectRatio(AspectRatio.PORTRAIT)} disabled={isLoading} className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-600 rounded-r-lg ${aspectRatio === AspectRatio.PORTRAIT ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}>9:16</button>
                        </div>
                    </div>
                    {/* Video Length */}
                    <div>
                        <span className="text-sm font-medium mr-3 text-gray-300">Length</span>
                        <div className="inline-flex rounded-md shadow-sm bg-gray-700">
                            <button onClick={() => setVideoLength(VideoLength.SHORT)} disabled={isLoading} className={`px-4 py-2 text-sm font-medium border border-gray-600 rounded-l-lg ${videoLength === VideoLength.SHORT ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}>Short</button>
                            <button onClick={() => setVideoLength(VideoLength.MEDIUM)} disabled={isLoading} className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-600 ${videoLength === VideoLength.MEDIUM ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}>Medium</button>
                            <button onClick={() => setVideoLength(VideoLength.LONG)} disabled={isLoading} className={`px-4 py-2 text-sm font-medium border-r border-t border-b border-gray-600 rounded-r-lg ${videoLength === VideoLength.LONG ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}`}>Long</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <HistoryPanel history={history} onSelect={selectHistoryItem} />
    </div>
  );
};

export default MainLayout;
