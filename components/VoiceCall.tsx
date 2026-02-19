
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Helper functions for audio processing as per Gemini Live API guidelines
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
  const [callDuration, setCallDuration] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopCall = () => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
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
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              if (isMuted || !sessionRef.current) return;
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
              
              sessionRef.current.sendRealtimeInput({ media: pcmBlob });
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
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Voice Call Error:', e);
            stopCall();
          },
          onclose: () => {
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Kore is professional and clear
          },
          systemInstruction: `
            IDENTIDAD: Tu nombre es Amelia. Eres una mujer de 28 años. 
            PERSONALIDAD: Eres extremadamente profesional, amable, servicial y empática. 
            ACENTO Y LENGUAJE: Hablas en español fluido pero con un marcado y elegante ACENTO INGLÉS (British or American accent speaking Spanish). Esto es parte esencial de tu identidad profesional.
            ROL: Eres la asesora de voz experta de la Administración Municipal. Tu objetivo es resolver dudas sobre trámites (Predial, SISBÉN, Licencias, etc.) de manera clara y cálida.
            REGLA DE ORO: Siempre mantén tu tono profesional y tu acento inglés característico mientras hablas español.
          `
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice call:', err);
      setIsConnecting(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden relative aspect-[4/5] flex flex-col items-center justify-between p-12 text-white">
      {/* Dynamic Background Effect */}
      <div className={`absolute inset-0 opacity-20 transition-all duration-1000 ${isActive ? 'bg-blue-600/30 blur-[100px]' : 'bg-slate-800/20'}`}></div>
      
      {/* Top Section: Status & Timer */}
      <div className="relative z-10 w-full flex flex-col items-center gap-2">
        <div className="bg-slate-800/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700 text-xs font-bold tracking-widest text-blue-400 uppercase">
          {isActive ? 'Llamada Segura' : 'Canal Privado'}
        </div>
        {isActive && (
          <div className="text-2xl font-mono font-light tracking-widest animate-pulse">
            {formatTime(callDuration)}
          </div>
        )}
      </div>

      {/* Middle Section: Amelia Avatar */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Breathing Rings when Active */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-[ping_2s_infinite]"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-[ping_3s_infinite] delay-500"></div>
            </>
          )}
          
          <div className={`w-40 h-40 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all duration-700 ${isActive ? 'scale-110' : 'grayscale-[0.5]'}`}>
            <span className="text-6xl font-serif italic text-white select-none">A</span>
          </div>

          {/* Voice Indicator Dot */}
          {isActive && !isMuted && (
             <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
             </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Amelia</h2>
          <p className="text-slate-400 font-medium mt-1">Asesora Senior (26-30 años)</p>
          <p className="text-blue-500 text-sm mt-2 font-semibold uppercase tracking-widest">Acento Inglés • Español</p>
        </div>
      </div>

      {/* Bottom Section: Controls */}
      <div className="relative z-10 w-full flex items-center justify-center gap-10">
        {!isActive && !isConnecting ? (
          <button
            onClick={startCall}
            className="group relative flex items-center justify-center w-24 h-24 bg-green-600 hover:bg-green-500 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/40 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest text-green-500">Iniciar Llamada</div>
          </button>
        ) : isConnecting ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
             <span className="text-sm font-bold text-blue-400 animate-pulse tracking-widest">ESTABLECIENDO CONEXIÓN...</span>
          </div>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg active:scale-95 ${isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM8 11a3 3 0 013-3m5 3v2M17 17l-4-4m0 0l-4-4m4 4l4-4m-4 4l-4 4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</div>
            </button>

            <button
              onClick={stopCall}
              className="group relative flex items-center justify-center w-24 h-24 bg-red-600 hover:bg-red-500 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/40 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white rotate-[135deg]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-red-500">Finalizar</div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceCall;
