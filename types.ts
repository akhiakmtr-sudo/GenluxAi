
export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum VideoLength {
  SHORT = 'Short (~4s)',
  MEDIUM = 'Medium (~8s)',
  LONG = 'Long (~12s)',
}

export interface HistoryItem {
  id: string;
  prompt: string;
  videoUrl: string;
  aspectRatio: AspectRatio;
  videoLength: VideoLength;
  timestamp: string;
}

export type VideoGenerationState = {
  status: 'idle' | 'generating' | 'extending' | 'polling' | 'fetching' | 'success' | 'error';
  message: string;
  videoUrl: string | null;
  error: string | null;
};
