
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <aside className="w-full md:w-80 bg-gray-900/80 backdrop-blur-md p-4 flex flex-col border-l border-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center">
        <i className="fas fa-history mr-2 text-purple-400"></i>
        History
      </h2>
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>Your generated videos will appear here.</p>
          </div>
        ) : (
          [...history].reverse().map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700/70 transition-all group"
            >
              <div className="relative mb-2">
                <video src={item.videoUrl} className="w-full h-auto rounded-md bg-black" muted />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-play text-white text-3xl"></i>
                </div>
              </div>
              <p className="text-sm text-gray-300 truncate font-medium">{item.prompt}</p>
              <p className="text-xs text-gray-500">{item.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistoryPanel;
