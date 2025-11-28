import { Component, OnInit, signal, PLATFORM_ID, inject, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { ChartOptions } from 'chart.js';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from 'src/app/components/footer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DashboardService } from '@core/services/dashboard.service';
import {
  DashboardStats,
  AlertasPorDia,
  AlertasPorHora,
  AlertaPorTipo,
  TiempoRespuestaPorDia,
} from '@core/interfaces/dashboard';
import { NgIcon } from "@ng-icons/core";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Card, UIChart, Navbar, Footer, ConfirmDialog, ToastModule, NgIcon],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  stats = signal<DashboardStats>({
    totalUsuarios: 0,
    totalAlertas: 0,
    alertasCanceladas: 0,
  });

  // Gráfica de alertas por día
  alertasPorDiaData: any;
  alertasPorDiaOptions!: ChartOptions;

  // Gráfica de alertas por hora del día (24hs)
  alertasPorHoraData: any;
  alertasPorHoraOptions!: ChartOptions;

  // Gráfica de distribución de tipos de alertas
  alertasPorTipoData: any;
  alertasPorTipoOptions!: ChartOptions;

  // Gráfica de tiempo de respuesta
  tiempoRespuestaData: any;
  tiempoRespuestaOptions!: ChartOptions;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) {
    // Inicializar estilos solo en el navegador
    afterNextRender(() => {
      this.initChartOptions();
      this.loadDashboardData();
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    // Si no es navegador, cargar datos de ejemplo
    if (!isPlatformBrowser(this.platformId)) {
      this.loadDashboardStats();
    }
  }

  /**
   * Carga todos los datos del dashboard desde el backend
   */
  private loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        // Actualizar estadísticas
        this.stats.set(data.estadisticas);

        // Actualizar gráficas solo si los datos existen
        if (data.alertasPorDia && Array.isArray(data.alertasPorDia)) {
          this.updateAlertasPorDiaChart(data.alertasPorDia);
        }
        if (data.alertasPorHora && Array.isArray(data.alertasPorHora)) {
          this.updateAlertasPorHoraChart(data.alertasPorHora);
        }
        if (data.alertasPorTipo && Array.isArray(data.alertasPorTipo)) {
          this.updateAlertasPorTipoChart(data.alertasPorTipo);
        }
        if (data.tiempoRespuesta && Array.isArray(data.tiempoRespuesta)) {
          this.updateTiempoRespuestaChart(data.tiempoRespuesta);
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las estadísticas del dashboard',
        });

        // Cargar datos de ejemplo como fallback
        this.loadDashboardStats();
      },
    });
  }

  /**
   * Inicializa las opciones de las gráficas (colores, estilos, etc.)
   */
  private initChartOptions() {
    const textColor = '#ffffff';
    const textColorSecondary = '#e5e7eb';
    const surfaceBorder = '#374151';

    this.alertasPorDiaData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Alertas Solucionadas',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          tension: 0.4,
        },
        {
          label: 'Alertas Canceladas',
          data: [8, 12, 10, 7, 5, 9, 6],
          fill: false,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          tension: 0.4,
        },
      ],
    };

    this.alertasPorDiaOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    // Alertas por hora
    const horas = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const alertasData = [2, 1, 0, 1, 0, 3, 8, 15, 22, 18, 14, 16, 19, 17, 15, 20, 25, 28, 24, 18, 12, 8, 5, 3];

    this.alertasPorHoraData = {
      labels: horas,
      datasets: [
        {
          label: 'Alertas',
          data: alertasData,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    this.alertasPorHoraOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            title: (context) => `Hora: ${context[0].label}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    // Alertas por tipo
    this.alertasPorTipoData = {
      labels: ['Emergencia Médica', 'Robo/Asalto', 'Accidente', 'Incendio', 'Otros'],
      datasets: [
        {
          data: [45, 25, 15, 10, 5],
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'],
          hoverBackgroundColor: ['#dc2626', '#d97706', '#2563eb', '#7c3aed', '#4b5563'],
        },
      ],
    };

    this.alertasPorTipoOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
          position: 'bottom',
        },
      },
    };

    // Tiempo de respuesta
    this.tiempoRespuestaData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Tiempo Promedio (min)',
          data: [3.5, 2.8, 4.2, 3.1, 2.9, 4.5, 3.8],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
        },
      ],
    };

    this.tiempoRespuestaOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
          beginAtZero: true,
        },
      },
    };
  }

  get porcentajeAlertasCanceladas(): number {
    const total = this.stats().totalAlertas;
    if (total === 0) return 0;
    return Math.round((this.stats().alertasCanceladas / total) * 100);
  }

  // ============ MÉTODOS PARA ACTUALIZAR GRÁFICAS CON DATOS DEL BACKEND ============

  private updateAlertasPorDiaChart(data: AlertasPorDia[]) {
    const labels = data.map((d) => this.formatFecha(d.fecha));
    const alertasSolucionadas = data.map((d) => d.alertasSolucionadas);
    const alertasCanceladas = data.map((d) => d.alertasCanceladas);

    this.alertasPorDiaData = {
      ...this.alertasPorDiaData,
      labels,
      datasets: [
        { ...this.alertasPorDiaData.datasets[0], data: alertasSolucionadas },
        { ...this.alertasPorDiaData.datasets[1], data: alertasCanceladas },
      ],
    };
  }

  private updateAlertasPorHoraChart(data: AlertasPorHora[]) {
    const labels = data.map((d) => `${d.hora}:00`);
    const cantidades = data.map((d) => d.cantidad);

    this.alertasPorHoraData = {
      ...this.alertasPorHoraData,
      labels,
      datasets: [{ ...this.alertasPorHoraData.datasets[0], data: cantidades }],
    };
  }

  private updateAlertasPorTipoChart(data: AlertaPorTipo[]) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }
    
    const labels = data.map((d) => d.tipo);
    const cantidades = data.map((d) => d.cantidad);

    this.alertasPorTipoData = {
      ...this.alertasPorTipoData,
      labels,
      datasets: [{ ...this.alertasPorTipoData.datasets[0], data: cantidades }],
    };
  }

  private updateTiempoRespuestaChart(data: TiempoRespuestaPorDia[]) {
    const labels = data.map((d) => this.formatFecha(d.fecha));
    const tiempos = data.map((d) => d.tiempoPromedioMinutos);

    this.tiempoRespuestaData = {
      ...this.tiempoRespuestaData,
      labels,
      datasets: [{ ...this.tiempoRespuestaData.datasets[0], data: tiempos }],
    };
  }

  /**
   * Formatea una fecha ISO a formato de día de la semana
   * Si ya viene como día de la semana, lo devuelve tal cual
   */
  private formatFecha(fecha: string): string {
    // Si ya es un día de la semana corto (Lun, Mar, etc.), retornar tal cual
    if (fecha.length <= 3) return fecha;

    // Si es formato ISO, convertir a día de la semana
    const date = new Date(fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[date.getDay()];
  }

  /**
   * Datos de ejemplo para cuando falla la conexión al backend
   */
  private loadDashboardStats() {
    this.stats.set({
      totalUsuarios: 1247,
      totalAlertas: 3856,
      alertasCanceladas: 142,
    });
  }
}
