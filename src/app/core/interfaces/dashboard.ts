// Interfaces para los datos del Dashboard

export interface DashboardStats {
  totalUsuarios: number;
  totalAlertas: number;
  alertasCanceladas: number;
}

export interface AlertasPorDia {
  fecha: string; // "2025-11-18" o "Lun", "Mar", etc.
  alertasSolucionadas: number;
  alertasCanceladas: number;
}

export interface AlertasPorHora {
  hora: number; // 0-23
  cantidad: number;
}

export interface AlertaPorTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

export interface TiempoRespuestaPorDia {
  fecha: string; // "2025-11-18" o "Lun", "Mar", etc.
  tiempoPromedioMinutos: number;
}

// Response completo del backend
export interface DashboardResponse {
  estadisticas: DashboardStats;
  alertasPorDia: AlertasPorDia[]; // Últimos 7 días
  alertasPorHora: AlertasPorHora[]; // 24 horas
  alertasPorTipo: AlertaPorTipo[];
  tiempoRespuesta: TiempoRespuestaPorDia[]; // Últimos 7 días
}
