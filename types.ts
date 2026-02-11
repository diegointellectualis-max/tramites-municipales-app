
export enum TramiteStatus {
  RECIBIDO = 'Recibido',
  EN_REVISION = 'En Revisión',
  PENDIENTE_DOCUMENTOS = 'Pendiente Documentos',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado'
}

export interface Area {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface TramiteInfo {
  id: string;
  nombre: string;
  descripcion: string;
  requisitos: string[];
  areaId: string;
  tiempoEstimado: string;
}

export interface Seguimiento {
  idRadicado: string;
  tramiteNombre: string;
  areaNombre: string;
  estado: TramiteStatus;
  fechaRadicacion: string;
  ultimaActualizacion: string;
  historial: {
    fecha: string;
    evento: string;
    detalle: string;
  }[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
