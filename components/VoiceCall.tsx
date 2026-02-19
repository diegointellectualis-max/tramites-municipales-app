
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Helper functions for audio processing as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
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

const VoiceCall: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const stopCall = () => {
    if (sessionRef.current) {
      // sessionRef.current.close(); // Not always available, we just clean up
      sessionRef.current = null;
    }
    
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    setIsActive(false);
    setIsConnecting(false);
    nextStartTimeRef.current = 0;
  };

  const startCall = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Amelia conectada');
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
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
            
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Error de voz:', e);
            stopCall();
          },
          onclose: () => {
            console.log('Llamada finalizada');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }, // Using a clean professional voice
          },
          systemInstruction: `
            Eres Amelia, una agente virtual de soporte del Portal de Trámites Municipales. 
            Tienes entre 26 y 30 años. Eres extremadamente profesional, amigable, cálida y eficiente.
            Hablas español con un ligero y elegante acento inglés, lo que te da un aire internacional y sofisticado.
            Tu misión es guiar al ciudadano en sus dudas sobre impuestos, licencias de construcción, SISBÉN y otros trámites de la alcaldía.
            Sé concisa pero servicial. Siempre saluda cordialmente al iniciar.
          `
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('No se pudo iniciar la llamada:', err);
      setIsConnecting(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      
      {/* Amelia Avatar Area */}
      <div className="relative mb-8">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl z-10 relative transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
          A
        </div>
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-blue-400 animate-ping opacity-20"></div>
            <div className="w-32 h-32 rounded-full bg-blue-300 animate-pulse opacity-10 scale-150"></div>
          </div>
        )}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800">Amelia</h3>
        <p className="text-slate-500 font-medium">Asesora Virtual de Trámites</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          {isActive ? (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              EN LLAMADA
            </span>
          ) : isConnecting ? (
            <span className="text-blue-500 text-sm font-bold animate-pulse">CONECTANDO...</span>
          ) : (
            <span className="text-slate-400 text-sm font-bold">DISPONIBLE</span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-6">
        {!isActive && !isConnecting ? (
          <button
            onClick={startCall}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-tighter">Llamar</span>
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className="group flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM8 11a3 3 0 013-3m5 3v2M17 17l-4-4m0 0l-4-4m4 4l4-4m-4 4l-4 4" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{isMuted ? 'Silenciado' : 'Silenciar'}</span>
            </button>

            <button
              onClick={stopCall}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-110 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-tighter">Colgar</span>
            </button>
          </>
        )}
      </div>

      <div className="mt-12 text-center p-4 bg-slate-50 rounded-2xl w-full border border-slate-100">
        <p className="text-xs text-slate-500 italic">
          "Hola, soy Amelia. Estoy aquí para ayudarte con cualquier trámite municipal de forma rápida y profesional."
        </p>
      </div>
    </div>
  );
};

export default VoiceCall;
