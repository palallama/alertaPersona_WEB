import { Component, OnInit, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { AppLogo } from "../../components/app-logo";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Footer } from "src/app/components/footer";

@Component({
  selector: 'app-landing',
  imports: [
    NgIcon,
    AppLogo,
    FormsModule,
    Footer
],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  open = false;
  
  // Modelo del formulario
  formData = {
    nombre: '',
    email: '',
    mensaje: ''
  };
  
  // Estado del formulario
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  ngOnInit() {}

  async onSubmitContact(event: Event) {
    event.preventDefault();
    
    if (!isPlatformBrowser(this.platformId)) return;
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    this.isSubmitting = true;
    this.submitMessage = '';
    
    try {
      await fetch('https://formspree.io/f/mvglqqdo', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          this.submitSuccess = true;
          this.submitMessage = '✅ ¡Mensaje enviado con éxito! Te responderemos pronto.';
          // Limpiar formulario
          this.formData = {
            nombre: '',
            email: '',
            mensaje: ''
          };
          form.reset();
        } else {
          throw new Error('Error en el envío');
        }
      });
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        this.submitMessage = '';
      }, 5000);
      
    } catch (error) {
      console.error('Error:', error);
      this.submitSuccess = false;
      this.submitMessage = '❌ Error al enviar el mensaje. Por favor intenta nuevamente.';
    } finally {
      this.isSubmitting = false;
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Importar Chart.js solo en el navegador
      import('chart.js/auto').then((ChartModule) => {
        const Chart = ChartModule.default;
        this.initCharts(Chart);
      });

      // Inicializar AOS si lo necesitas
      if (typeof window !== 'undefined') {
        import('aos').then((AOS) => {
          AOS.default.init({
            duration: 800,
            once: true,
            offset: 80,
          });
        });
      }
    }
  }

  private initCharts(Chart: any) {
    // Gráfico de satisfacción
    const satisfactionCtx = document.getElementById('satisfactionChart') as HTMLCanvasElement;
    if (satisfactionCtx) {
      new Chart(satisfactionCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Sí', 'No'],
          datasets: [{
            label: '¿Alguna vez te sentiste en peligro en la vía pública?',
            data: [79.1, 20.9],
            backgroundColor: ['#FF0000', '#0b74d1'],
            borderColor: '#2b3440',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem: any) {
                  return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                }
              }
            }
          }
        }
      });
    }

    // Gráfico de edades
    const usageCtx = document.getElementById('usageChart') as HTMLCanvasElement;
    if (usageCtx) {
      new Chart(usageCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['13-17', '18-24', '25-34', '35-45', 'Mayor de 45'],
          datasets: [{
            label: 'Edades de encuestados/as',
            data: [2.9, 25.4, 29.9, 34.3, 7.5],
            backgroundColor: '#0b74d1',
            borderColor: '#2b3440',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              position: 'top',
            }
          }
        }
      });
    }
  }
}
