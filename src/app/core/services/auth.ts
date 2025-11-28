import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserStorageService } from './user-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  
  constructor(
    private http: HttpClient,
    private userStorage: UserStorageService,
  ) { }
  URL_COMPLETA = environment.BASE_URL;

  private readonly accessTokenKey = 'access_token'
  private readonly refreshTokenKey = 'refresh_token'


  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem(this.accessTokenKey);
      return token;
    }
    return null;
  }
  setAccessToken(accessToken:string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.accessTokenKey, accessToken);
    }
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.accessTokenKey, accessToken)
      sessionStorage.setItem(this.refreshTokenKey, refreshToken)
    }
  }

  clearTokens() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.accessTokenKey)
      sessionStorage.removeItem(this.refreshTokenKey)
    }
  }

  refreshToken(): Observable<string> {
    const refresh = this.getRefreshToken()
    return this.http.post<any>(`${this.URL_COMPLETA}/auth/refresh`, { refreshToken: refresh })
  }

  verifyToken(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) return of(false);
    return this.http.get(`${this.URL_COMPLETA}/auth/profile`).pipe(
      // tap(() => console.log('verifyToken - Respuesta exitosa')),
      map(() => true), // si responde 200
      catchError((error) => {
        console.log('verifyToken - Error:', error);
        return of(false);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.URL_COMPLETA}/auth/loginAdmin`, credentials).pipe(
      tap((res: any) => {
        // console.log('Respuesta login:', res);
        this.setTokens(res.access_token, res.refresh_token);
        this.userStorage.setUsuario(res.usuario, false);
      })
    )
  }

  logout(): void {
    this.clearTokens();
    this.userStorage.clearUsuario()
  }

}
