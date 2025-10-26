
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, VideoLength } from '../types';

// This is a placeholder for the actual type from the SDK, which may not be exported.
// Using 'any' allows us to handle the operation object without strict typing issues.
type VideoOperation = any;

const pollOperation = async <T,>(operation: T, ai: GoogleGenAI): Promise<T> => {
  let currentOperation = operation;
  while ((currentOperation as any).done === false) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
  }
  return currentOperation;
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  videoLength: VideoLength,
  onProgress: (message: string) => void,
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please select an API key.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let finalVideoUrl = '';

  try {
    // Initial Generation
    onProgress("Starting video generation...");
    let operation: VideoOperation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
      }
    });

    onProgress("Your request is in the queue. Polling for updates...");
    operation = await pollOperation(operation, ai);

    let baseVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!baseVideo) throw new Error("Initial video generation failed.");

    // Extensions
    const extensionsNeeded = videoLength === VideoLength.MEDIUM ? 1 : videoLength === VideoLength.LONG ? 2 : 0;
    
    for (let i = 0; i < extensionsNeeded; i++) {
        onProgress(`Extending video... (${i + 1}/${extensionsNeeded})`);
        let extensionOperation: VideoOperation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'continue the scene, make it more dynamic',
            video: baseVideo,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });

        onProgress(`Polling for extension ${i + 1}...`);
        extensionOperation = await pollOperation(extensionOperation, ai);
        
        baseVideo = extensionOperation.response?.generatedVideos?.[0]?.video;
        if (!baseVideo) throw new Error(`Video extension ${i + 1} failed.`);
    }

    const downloadLink = baseVideo.uri;
    if (!downloadLink) {
      throw new Error("Failed to get video download link.");
    }

    onProgress("Fetching final video...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to download video: ${response.statusText} - ${errorBody}`);
    }

    const videoBlob = await response.blob();
    finalVideoUrl = URL.createObjectURL(videoBlob);
    
  } catch (err) {
      console.error("Error in generateVideo:", err);
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
          throw new Error("API_KEY_INVALID");
      }
      throw err;
  }

  return finalVideoUrl;
};
