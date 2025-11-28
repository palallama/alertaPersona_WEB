import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  DashboardResponse,
  DashboardStats,
  AlertasPorDia,
  AlertasPorHora,
  AlertaPorTipo,
  TiempoRespuestaPorDia
} from '@core/interfaces/dashboard';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.BASE_URL}/estadisticas/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las estadísticas del dashboard en una sola llamada
   * Usa el endpoint principal que retorna todo
   */
  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }

  /**
   * Obtiene todas las estadísticas combinando los endpoints individuales
   * Útil si el endpoint principal no está disponible
   */
  getDashboardDataCombined(dias: number = 7): Observable<DashboardResponse> {
    return forkJoin({
      estadisticas: this.getEstadisticas(),
      alertasPorDia: this.getAlertasPorDia(dias),
      alertasPorHora: this.getAlertasPorHora(),
      alertasPorTipo: [], // TODO: Implementar cuando esté disponible
      tiempoRespuesta: [] // TODO: Implementar cuando esté disponible
    });
  }

  /**
   * Obtiene las estadísticas generales del dashboard
   */
  getEstadisticas(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/estadisticas/dashboard`);
  }

  /**
   * Obtiene las alertas por día
   * @param dias Número de días a consultar (por defecto 7)
   */
  getAlertasPorDia(dias: number = 7): Observable<AlertasPorDia[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<AlertasPorDia[]>(`${this.apiUrl}/alertas-por-dia`, { params });
  }

  /**
   * Obtiene las alertas por hora del día (24 horas)
   */
  getAlertasPorHora(): Observable<AlertasPorHora[]> {
    return this.http.get<AlertasPorHora[]>(`${this.apiUrl}/alertas-por-hora`);
  }

  /**
   * Obtiene las alertas por tipo
   * TODO: Implementar cuando el endpoint esté disponible
   */
  getAlertasPorTipo(): Observable<AlertaPorTipo[]> {
    return this.http.get<AlertaPorTipo[]>(`${this.apiUrl}/alertas-por-tipo`);
  }

  /**
   * Obtiene el tiempo de respuesta promedio por día
   * TODO: Implementar cuando el endpoint esté disponible
   * @param dias Número de días a consultar (por defecto 7)
   */
  getTiempoRespuesta(dias: number = 7): Observable<TiempoRespuestaPorDia[]> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<TiempoRespuestaPorDia[]>(`${this.apiUrl}/tiempo-respuesta`, { params });
  }
}
