
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

/**
 * Always use named parameter for apiKey and obtain it exclusively from process.env.API_KEY.
 * Do not ask the user for it or define it elsewhere.
 */
export const createAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const MODELS = {
  TEXT_FLASH: 'gemini-3-flash-preview',
  TEXT_PRO: 'gemini-3-pro-preview',
  IMAGE: 'gemini-2.5-flash-image',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts'
};

// Helper for encoding as required by Live API instructions
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper for decoding as required by Live API instructions
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Custom audio decoder for raw PCM data from Gemini Live API.
 * Do not use browser's native AudioContext.decodeAudioData for streaming PCM data.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateImage = async (prompt: string): Promise<string | null> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it uses current config.
  const ai = createAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
  }
  return null;
};
