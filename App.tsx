
import React, { useState, useEffect } from 'react';
import { AREAS, TRAMITES, SEGUIMIENTOS_MOCK, BACKGROUND_IMAGES } from './constants';
import { Seguimiento, TramiteStatus } from './types';
import ChatAssistant from './components/ChatAssistant';
import VoiceCall from './components/VoiceCall';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'seguimiento' | 'info' | 'voz'>('inicio');
  const [searchId, setSearchId] = useState('');
  const [trackingResult, setTrackingResult] = useState<Seguimiento | null>(null);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax effect based on mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate a slight offset based on mouse position
      const moveX = (e.clientX / window.innerWidth - 0.5) * 30;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x: moveX, y: moveY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = SEGUIMIENTOS_MOCK[searchId];
    if (result) {
      setTrackingResult(result);
    } else {
      setTrackingResult(null);
      setError('No se encontró ningún trámite con ese número de radicado.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Dynamic Immersive Background Layer */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        {/* We map all images and only show the active one with high opacity to allow cross-fading */}
        {(Object.entries(BACKGROUND_IMAGES) as [keyof typeof BACKGROUND_IMAGES, string][]).map(([key, url]) => (
          <div 
            key={key}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center scale-110 ${activeTab === key ? 'opacity-100 scale-100 translate-z-0' : 'opacity-0 scale-125 translate-z-0'}`}
            style={{
              backgroundImage: `url(${url})`,
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) ${activeTab === key ? 'scale(1.1)' : 'scale(1.2)'}`,
              filter: 'brightness(0.95)'
            }}
          >
            {/* Subtle Gradient Overlay for Content Legibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/85 to-blue-50/70 backdrop-blur-[2px]"></div>
          </div>
        ))}
      </div>

      {/* Modern Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Area */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveTab('inicio')}
            >
              <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-all duration-500 ease-out rotate-0 group-hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">GESTIÓN MUNICIPAL</h1>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] opacity-80">Portal Ciudadano</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center bg-slate-200/40 p-1.5 rounded-full backdrop-blur-sm border border-white/50">
              <button 
                onClick={() => setActiveTab('inicio')}
                className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'inicio' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Trámites
              </button>
              <button 
                onClick={() => setActiveTab('seguimiento')}
                className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'seguimiento' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Seguimiento
              </button>
              <button 
                onClick={() => setActiveTab('voz')}
                className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 ${activeTab === 'voz' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'voz' ? 'bg-white' : 'bg-blue-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTab === 'voz' ? 'bg-white' : 'bg-blue-500'}`}></span>
                </span>
                Llamar Amelia
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 ${activeTab === 'info' ? 'bg-white text-blue-700 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Info
              </button>
            </nav>

            {/* Action Area */}
            <div className="flex items-center gap-3">
              <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95">
                Acceder
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative">
        
        {/* Dynamic Transition Wrapper */}
        <div className="transition-all duration-500 ease-out">
          
          {activeTab === 'inicio' && (
            <section className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight sm:text-6xl">
                  Trámites sin <br/> <span className="text-blue-600 relative inline-block">
                    complicaciones.
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100 -z-10"></span>
                  </span>
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Gestione sus solicitudes administrativas de forma segura, digital y transparente desde cualquier lugar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {AREAS.map(area => (
                  <div 
                    key={area.id} 
                    className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 shadow-sm border border-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group cursor-pointer hover:-translate-y-2 duration-500"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">
                        {area.icono}
                      </div>
                      <div className="bg-slate-100 p-2.5 rounded-full text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">{area.nombre}</h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-semibold opacity-80">{area.descripcion}</p>
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Servicios Clave</h4>
                      <ul className="text-sm text-blue-700 font-black space-y-3">
                        {TRAMITES.filter(t => t.areaId === area.id).map(t => (
                          <li key={t.id} className="flex items-center gap-3 group/item">
                            <span className="w-2 h-2 bg-blue-500 rounded-full group-hover/item:scale-150 transition-transform"></span>
                            {t.nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'seguimiento' && (
            <section className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-900 rounded-[3.5rem] p-12 sm:p-20 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-10">
                  <div className="space-y-4">
                    <span className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs">Consulta en Tiempo Real</span>
                    <h2 className="text-5xl font-black leading-tight">Rastrea tu <br/> Solicitud</h2>
                  </div>
                  
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 bg-white/10 p-2.5 rounded-[2.5rem] border border-white/20 backdrop-blur-md">
                    <input 
                      type="text" 
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                      placeholder="NÚMERO DE RADICADO..."
                      className="flex-1 bg-transparent px-8 py-5 rounded-full text-white text-lg focus:outline-none placeholder:text-slate-500 font-mono font-bold tracking-widest"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-full font-black text-lg transition-all shadow-xl shadow-blue-600/30 active:scale-95">
                      CONSULTAR
                    </button>
                  </form>
                  
                  {error && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                      <p className="text-red-400 font-bold bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-sm flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Decorative Visuals for Tracking Section */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-[100px]"></div>
              </div>

              {trackingResult && (
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-10 space-y-12 animate-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Referencia Oficial</span>
                      <h3 className="text-4xl font-mono font-black text-slate-900 tracking-tighter">{trackingResult.idRadicado}</h3>
                    </div>
                    <div className={`px-8 py-4 rounded-2xl text-sm font-black tracking-widest uppercase border-2 ${
                      trackingResult.estado === TramiteStatus.APROBADO ? 'bg-green-500 text-white border-green-400' :
                      trackingResult.estado === TramiteStatus.RECHAZADO ? 'bg-red-500 text-white border-red-400' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                      {trackingResult.estado}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="md:col-span-2 space-y-12">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        Línea de Vida del Expediente
                      </h4>
                      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-7 before:h-full before:w-1 before:bg-slate-100/50">
                        {trackingResult.historial.map((item, idx) => (
                          <div key={idx} className="relative flex items-start gap-10 group">
                            <div className={`mt-1 flex-shrink-0 w-14 h-14 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center z-10 transition-all duration-500 ${idx === 0 ? 'bg-blue-600 text-white scale-110 shadow-blue-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                              <span className="text-base font-black">{trackingResult.historial.length - idx}</span>
                            </div>
                            <div className="bg-white/60 p-8 rounded-3xl border border-white flex-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-black text-slate-900 text-xl">{item.evento}</h5>
                                <span className="text-[10px] text-slate-400 font-black bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{item.fecha}</span>
                              </div>
                              <p className="text-slate-500 font-semibold leading-relaxed">{item.detalle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Información General</h4>
                          <div className="space-y-6">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Procedimiento</p>
                              <p className="font-black text-lg leading-tight">{trackingResult.tramiteNombre}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Secretaría</p>
                              <p className="font-bold">{trackingResult.areaNombre}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Última Gestión</p>
                              <p className="font-black text-blue-400">{trackingResult.ultimaActualizacion}</p>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'voz' && (
            <section className="space-y-16 animate-in fade-in zoom-in-95 duration-1000">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl">
                  Amelia: Soporte <br/> <span className="text-blue-600">por Voz.</span>
                </h2>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  Conéctese con Amelia para una asistencia rápida, amable y 100% personalizada. Nuestra IA entiende sus necesidades de inmediato.
                </p>
              </div>
              
              <div className="relative group">
                {/* Background glow for Amelia component */}
                <div className="absolute inset-0 bg-blue-500/10 rounded-[3rem] blur-3xl group-hover:bg-blue-500/15 transition-all duration-700"></div>
                <VoiceCall />
              </div>

              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm flex gap-6 items-center hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group">
                  <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-all duration-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">IA de Vanguardia</h4>
                    <p className="text-slate-500 font-bold opacity-70">Modelos Gemini 2.5 Live para una charla humana.</p>
                  </div>
                </div>
                <div className="p-8 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm flex gap-6 items-center hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group">
                  <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Privacidad Total</h4>
                    <p className="text-slate-500 font-bold opacity-70">Sus datos y voz están protegidos bajo protocolos oficiales.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'info' && (
            <section className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[3rem] shadow-sm border border-white space-y-8 group hover:shadow-2xl transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">Marco Legal de Radicados</h3>
                  <p className="text-slate-500 font-bold leading-relaxed opacity-80 text-lg">
                    Todo ciudadano tiene derecho a recibir un número único de identificación para sus peticiones. Este sistema garantiza la transparencia y el seguimiento puntual de cada solicitud.
                  </p>
                  <button className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 group/btn">
                    Ver Ley Antitrámites
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>

                <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[3rem] shadow-sm border border-white space-y-8 group hover:shadow-2xl transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">Garantía de Tiempo</h3>
                  <p className="text-slate-500 font-bold leading-relaxed opacity-80 text-lg">
                    La administración municipal se compromete a cumplir con los términos legales de respuesta, optimizando procesos internos para reducir esperas innecesarias para el ciudadano.
                  </p>
                  <button className="text-blue-600 font-black text-sm uppercase tracking-widest flex items-center gap-3 group/btn">
                    Tiempos Promedio 2024
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Footer CTA for Information */}
              <div className="bg-slate-900 text-white rounded-[4rem] p-12 sm:p-24 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <span className="text-blue-500 font-black tracking-[0.4em] uppercase text-xs">Puntos de Contacto</span>
                      <h3 className="text-5xl sm:text-6xl font-black leading-tight tracking-tighter">Atención <br/> Presencial.</h3>
                    </div>
                    <div className="space-y-10">
                      <div className="flex items-center gap-8 group/link">
                        <div className="bg-white/10 p-5 rounded-[1.5rem] group-hover/link:bg-blue-600 group-hover/link:scale-110 transition-all duration-500">📍</div>
                        <div>
                          <p className="font-black text-2xl tracking-tight">Centro Administrativo</p>
                          <p className="text-slate-400 font-bold text-lg">Ventanilla Única, Planta Baja</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 group/link">
                        <div className="bg-white/10 p-5 rounded-[1.5rem] group-hover/link:bg-blue-600 group-hover/link:scale-110 transition-all duration-500">📞</div>
                        <div>
                          <p className="font-black text-2xl tracking-tight">01 8000 000 000</p>
                          <p className="text-slate-400 font-bold text-lg">Asistencia Ciudadana Gratuita</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="relative transform hover:scale-105 transition-transform duration-700">
                      <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000" 
                        alt="Administración Municipal" 
                        className="rounded-[3rem] shadow-2xl relative z-10 brightness-90 grayscale-[0.2] hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                      />
                    </div>
                  </div>
                </div>
                {/* Decorative background element for CTA */}
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-blue-600/10 blur-3xl rounded-full -mb-32 -mr-32"></div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Elegant Refined Footer */}
      <footer className="bg-white/40 backdrop-blur-2xl border-t border-white/50 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-10">
            <div className="flex flex-col items-center gap-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/100px-Flag_of_Colombia.svg.png" alt="Colombia" className="h-4 object-contain shadow-sm opacity-90" />
              <div className="flex flex-col items-center">
                <span className="font-black text-slate-400 uppercase tracking-[0.5em] text-[10px] mb-2">República de Colombia</span>
                <span className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">ADMINISTRACIÓN MUNICIPAL MODERNA</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-black italic max-w-lg leading-relaxed">
              "Innovación tecnológica al servicio de la transparencia pública y la eficiencia ciudadana."
            </p>
            <div className="flex flex-wrap justify-center gap-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pt-12 border-t border-slate-200/50 w-full">
              <a href="#" className="hover:text-blue-600 transition-colors">Normatividad</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Transparencia</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Datos Abiertos</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Políticas de Privacidad</a>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4">© 2024 Portal Único de Trámites. Colombia.</p>
          </div>
        </div>
      </footer>

      {/* Integrated Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default App;
