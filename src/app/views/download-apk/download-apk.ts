import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppConfigService } from '../../core/services/app-config.service';

@Component({
  selector: 'app-download-apk',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <p>Descargando la última versión de AlertaPersona...</p>
      <p style="margin-top: 10px; font-size: 14px; color: #666;">Si la descarga no comienza automáticamente, 
        <a [href]="downloadUrl" download>haz clic aquí</a>
      </p>
    </div>
  `,
})
export class DownloadApkComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private appConfigService = inject(AppConfigService);
  downloadUrl = '';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.appConfigService.loadConfig().subscribe({
        next: (config) => {
          this.downloadUrl = config.apk.url;
          // Redirigir automáticamente a la URL de descarga
          window.location.href = config.apk.url;
        },
        error: (err) => {
          console.error('Error cargando config:', err);
          // Intentar con la URL por defecto
          this.downloadUrl = '/AlertaPersona_v0.1.apk';
          window.location.href = this.downloadUrl;
        }
      });
    }
  }
}
