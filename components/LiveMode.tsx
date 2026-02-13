
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createAI, MODELS, encode, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import AuraCircle from './AuraCircle';
import { Mic, MicOff, PhoneOff, Settings } from 'lucide-react';

interface LiveModeProps {
    onClose: () => void;
}

const IURYNEX_VOICE_INSTRUCTION = `
Eres Aura, la asistente jurídica inteligente de IURYNEX en Ecuador. 
Tu tono por voz debe ser calmado, seguro, profesional y empático.
Respondes en español.
Tu objetivo es dar orientación legal rápida y guiar al usuario sobre los servicios de IURYNEX (asesoría virtual, acompañamiento legal, consultas online).
Si el usuario tiene un problema legal serio, indícale calmadamente que IURYNEX cuenta con abogados expertos que pueden tomar su caso y oriéntale sobre cómo agendar.
Mantén tus respuestas breves y directas, adecuadas para una conversación por voz.
Recuerda el eslogan: "El Derecho que piensa contigo".
`;

const LiveMode: React.FC<LiveModeProps> = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const sessionRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        sourcesRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) {}
        });
        sourcesRef.current.clear();
        setIsConnected(false);
    }, []);

    const startSession = async () => {
        try {
            const ai = createAI();
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = inputCtx;
            outputContextRef.current = outputCtx;

            const sessionPromise = ai.live.connect({
                model: MODELS.LIVE,
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        const source = inputCtx.createMediaStreamSource(streamRef.current!);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (e) => {
                            if (isMuted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            
                            let sum = 0;
                            for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
                            setAudioLevel(Math.sqrt(sum / inputData.length));

                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };

                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(outputCtx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                            sourcesRef.current.add(source);
                            source.onended = () => sourcesRef.current.delete(source);
                        }
                        
                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                try { source.stop(); } catch (e) {}
                            }
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e) => {
                        console.error("Error en sesión Live", e);
                        setError("Se ha perdido la conexión. Por favor, reinicia la llamada.");
                    },
                    onclose: () => setIsConnected(false)
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: IURYNEX_VOICE_INSTRUCTION
                }
            });

            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setError("Error al acceder al micrófono. Por favor verifica los permisos.");
        }
    };

    useEffect(() => {
        startSession();
        return cleanup;
    }, []);

    return (
        <div className="flex flex-col items-center justify-between h-full p-8">
            <div className="flex flex-col items-center gap-4 mt-12 text-center">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">Orientación Vocal</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <p className="text-slate-400 font-medium">
                        {isConnected ? "Aura te escucha..." : "Conectando con IURYNEX..."}
                    </p>
                </div>
                {error && <p className="text-red-400 text-sm mt-2 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">{error}</p>}
            </div>

            <AuraCircle isActive={isConnected} level={audioLevel * 5} />

            <div className="flex items-center gap-8 mb-12">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full glass transition-all border border-white/5 ${isMuted ? 'text-red-400 bg-red-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                    title={isMuted ? "Activar Micrófono" : "Silenciar Micrófono"}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button 
                    onClick={onClose}
                    className="p-6 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/20"
                    title="Finalizar Orientación"
                >
                    <PhoneOff size={32} />
                </button>

                <button className="p-4 rounded-full glass text-slate-300 hover:text-white hover:bg-white/5 border border-white/5">
                    <Settings size={24} />
                </button>
            </div>
        </div>
    );
};

export default LiveMode;
