import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AppVersionConfig {
  apk: {
    version: string;
    url: string;
    downloadName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private http = inject(HttpClient);
  private configSubject = new BehaviorSubject<AppVersionConfig | null>(null);
  
  public config$ = this.configSubject.asObservable();

  loadConfig(): Observable<AppVersionConfig> {
    return this.http.get<AppVersionConfig>('/apk/version.json').pipe(
      tap(config => this.configSubject.next(config)),
      catchError((error) => {
        console.error('Error loading config:', error);
        // Fallback en caso de error
        const fallbackConfig: AppVersionConfig = {
          apk: { 
            version: 'v0.1',
            url: '/AlertaPersona_v0.1.apk',
            downloadName: 'AlertaPersona_v0.1.apk'
          }
        };
        this.configSubject.next(fallbackConfig);
        return [fallbackConfig];
      })
    );
  }

  getApkVersion(): string {
    return this.configSubject.value?.apk.version || 'v0.1';
  }

  getApkDownloadUrl(): string {
    return this.configSubject.value?.apk.url || '/AlertaPersona_v0.1.apk';
  }

  getApkFileName(): string {
    return this.configSubject.value?.apk.downloadName || 'AlertaPersona_v0.1.apk';
  }
}
