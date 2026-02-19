
import React from 'react';
import { Area, TramiteInfo, TramiteStatus, Seguimiento } from './types';

export const AREAS: Area[] = [
  { id: 'planeacion', nombre: 'Secretaría de Planeación', descripcion: 'Gestión del territorio y licencias de construcción.', icono: '🏗️' },
  { id: 'gobierno', nombre: 'Secretaría de Gobierno', descripcion: 'Convivencia ciudadana y trámites administrativos.', icono: '⚖️' },
  { id: 'hacienda', nombre: 'Secretaría de Hacienda', descripcion: 'Impuesto predial, industria y comercio.', icono: '💰' },
  { id: 'salud', nombre: 'Secretaría de Salud', descripcion: 'Afiliación al SISBÉN y vigilancia sanitaria.', icono: '🏥' },
  { id: 'transito', nombre: 'Secretaría de Tránsito', descripcion: 'Multas, licencias y movilidad urbana.', icono: '🚗' },
  { id: 'policia', nombre: 'Inspección de Policía', descripcion: 'Querellas y procesos de convivencia.', icono: '👮' },
];

export const TRAMITES: TramiteInfo[] = [
  {
    id: 't1',
    areaId: 'planeacion',
    nombre: 'Licencia de Construcción',
    descripcion: 'Autorización previa para desarrollar edificaciones.',
    requisitos: ['Cédula', 'Certificado Tradición', 'Planos Arquitectónicos', 'Pago expensas'],
    tiempoEstimado: '45 días hábiles'
  },
  {
    id: 't2',
    areaId: 'hacienda',
    nombre: 'Pago Impuesto Predial',
    descripcion: 'Liquidación y pago de impuesto sobre inmuebles.',
    requisitos: ['Número de matricula inmobiliaria', 'Cédula del propietario'],
    tiempoEstimado: 'Inmediato'
  },
  {
    id: 't3',
    areaId: 'salud',
    nombre: 'Certificado de Discapacidad',
    descripcion: 'Documento que certifica la condición de discapacidad.',
    requisitos: ['Historia clínica reciente', 'Documento de identidad'],
    tiempoEstimado: '15 días hábiles'
  }
];

// Mock data for search
export const SEGUIMIENTOS_MOCK: Record<string, Seguimiento> = {
  'RAD-2024-001': {
    idRadicado: 'RAD-2024-001',
    tramiteNombre: 'Licencia de Construcción',
    areaNombre: 'Secretaría de Planeación',
    estado: TramiteStatus.EN_REVISION,
    fechaRadicacion: '2024-01-15',
    ultimaActualizacion: '2024-01-20',
    historial: [
      { fecha: '2024-01-15', evento: 'Radicación', detalle: 'Documentos recibidos por ventanilla única.' },
      { fecha: '2024-01-18', evento: 'Asignación Técnica', detalle: 'Expediente asignado al arquitecto revisor.' },
      { fecha: '2024-01-20', evento: 'Revisión Preliminar', detalle: 'Se verifica cumplimiento de normas urbanísticas.' }
    ]
  }
};

export const BACKGROUND_IMAGES = {
  inicio: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000', // Modern Office Lobby
  seguimiento: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000', // Financial/Professional Documents
  voz: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80&w=2000', // Modern Meeting Space
  info: 'https://images.unsplash.com/photo-1451187530220-cf006d45fba7?auto=format&fit=crop&q=80&w=2000'  // Digital City Connectivity
};
