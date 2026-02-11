
import React, { useState } from 'react';
import { AREAS, TRAMITES, SEGUIMIENTOS_MOCK } from './constants.tsx';
import { Seguimiento, TramiteStatus } from './types.ts';
import ChatAssistant from './components/ChatAssistant.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inicio' | 'seguimiento' | 'info'>('inicio');
  const [searchId, setSearchId] = useState('');
  const [trackingResult, setTrackingResult] = useState<Seguimiento | null>(null);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = SEGUIMIENTOS_MOCK[searchId];
    if (result) {
      setTrackingResult(result);
    } else {
      setTrackingResult(null);
      setError('No se encontró ningún trámite con ese número de radicado. Verifica el código e intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('inicio')}>
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Gestión Municipal</h1>
                <p className="text-sm text-slate-500">Portal Único de Trámites - Colombia</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('inicio')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeTab === 'inicio' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Trámites por Áreas
              </button>
              <button 
                onClick={() => setActiveTab('seguimiento')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeTab === 'seguimiento' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Seguimiento de Radicados
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeTab === 'info' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Información al Ciudadano
              </button>
            </nav>

            <div className="flex items-center">
              <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors border border-slate-200">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inicio' && (
          <section className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                ¿Qué trámite deseas realizar hoy?
              </h2>
              <p className="text-lg text-slate-600">
                Selecciona el área administrativa correspondiente para conocer requisitos, costos y tiempos de respuesta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AREAS.map(area => (
                <div key={area.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{area.icono}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{area.nombre}</h3>
                  <p className="text-slate-600 text-sm mb-4">{area.descripcion}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trámites destacados</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {TRAMITES.filter(t => t.areaId === area.id).slice(0, 2).map(t => (
                        <li key={t.id} className="hover:underline">→ {t.nombre}</li>
                      ))}
                      {TRAMITES.filter(t => t.areaId === area.id).length === 0 && (
                        <li className="text-slate-400 italic">Próximamente más trámites</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'seguimiento' && (
          <section className="max-w-4xl mx-auto space-y-8">
            <div className="bg-blue-700 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-bold">Rastrea tu solicitud</h2>
                <p className="text-blue-100 max-w-xl">
                  Ingresa el número de radicado que se te entregó al momento de presentar tu trámite para conocer su estado actual.
                </p>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                      placeholder="Ej: RAD-2024-001"
                      className="w-full px-6 py-4 rounded-xl text-slate-900 text-lg focus:ring-4 focus:ring-blue-300 outline-none placeholder:text-slate-400 font-mono"
                    />
                  </div>
                  <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
                    Consultar Estado
                  </button>
                </form>
                {error && <p className="text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-500/50 text-sm">{error}</p>}
                <p className="text-xs text-blue-200">Prueba con: <span className="font-mono font-bold text-white">RAD-2024-001</span></p>
              </div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {trackingResult && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Número de Radicado</span>
                    </div>
                    <h3 className="text-2xl font-mono font-bold text-slate-900">{trackingResult.idRadicado}</h3>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${
                    trackingResult.estado === TramiteStatus.APROBADO ? 'bg-green-50 text-green-700 border-green-200' :
                    trackingResult.estado === TramiteStatus.RECHAZADO ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      trackingResult.estado === TramiteStatus.APROBADO ? 'bg-green-500' :
                      trackingResult.estado === TramiteStatus.RECHAZADO ? 'bg-red-500' :
                      'bg-amber-500'
                    }`}></span>
                    {trackingResult.estado}
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Línea de Tiempo del Proceso
                    </h4>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200">
                      {trackingResult.historial.map((item, idx) => (
                        <div key={idx} className="relative flex items-start gap-6 group">
                          <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${idx === 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <span className="text-xs font-bold">{trackingResult.historial.length - idx}</span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-slate-900">{item.evento}</h5>
                              <span className="text-xs text-slate-500 font-medium">{item.fecha}</span>
                            </div>
                            <p className="text-sm text-slate-600">{item.detalle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Detalles Generales</h4>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-xs text-slate-400 font-semibold mb-1">Trámite</dt>
                          <dd className="text-sm font-medium text-slate-700">{trackingResult.tramiteNombre}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400 font-semibold mb-1">Secretaría Responsable</dt>
                          <dd className="text-sm font-medium text-slate-700">{trackingResult.areaNombre}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400 font-semibold mb-1">Fecha de Radicación</dt>
                          <dd className="text-sm font-medium text-slate-700">{trackingResult.fechaRadicacion}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400 font-semibold mb-1">Última Actualización</dt>
                          <dd className="text-sm font-medium text-slate-700">{trackingResult.ultimaActualizacion}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Siguientes Pasos
                      </h4>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Su solicitud se encuentra actualmente en revisión técnica. Recibirá una notificación vía correo electrónico cuando el estado cambie a "Finalizado".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'info' && (
          <section className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">¿Qué es el Radicado?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Es el número único de identificación asignado a su solicitud. Con este número usted puede hacer seguimiento a través de nuestra web o en las oficinas de atención al ciudadano.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tiempos de Respuesta</h3>
                <p className="text-slate-600 leading-relaxed">
                  Los tiempos varían según el tipo de trámite y la secretaría. Por ley, el término general para responder peticiones es de 15 días hábiles, pero trámites como licencias pueden tomar más tiempo.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold">Canales de Atención</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">📍</div>
                      <div>
                        <p className="font-bold">Oficina Principal</p>
                        <p className="text-slate-400 text-sm">Calle 123 # 45-67, Palacio Municipal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">📞</div>
                      <div>
                        <p className="font-bold">Línea Telefónica</p>
                        <p className="text-slate-400 text-sm">01 8000 999 888 (Línea Nacional)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">📧</div>
                      <div>
                        <p className="font-bold">Correo Electrónico</p>
                        <p className="text-slate-400 text-sm">tramites@alcaldia.gov.co</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img src="https://picsum.photos/id/122/600/400" alt="Palacio Municipal" className="rounded-2xl shadow-2xl grayscale" />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-8 grayscale opacity-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/100px-Flag_of_Colombia.svg.png" alt="Colombia Flag" className="h-6 object-contain" />
            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Gobierno Digital de Colombia</span>
          </div>
          <p className="text-slate-400 text-xs mb-2">© 2024 Administración Municipal - Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500 uppercase">
            <a href="#" className="hover:text-blue-600">Privacidad</a>
            <a href="#" className="hover:text-blue-600">Términos de Uso</a>
            <a href="#" className="hover:text-blue-600">Mapa del Sitio</a>
          </div>
        </div>
      </footer>

      <ChatAssistant />
    </div>
  );
};

export default App;
