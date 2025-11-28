import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { finalize } from 'rxjs';
import { AppLogo } from '../../../components/app-logo';
import { AuthService } from '@core/services/auth';
import { MessageService } from 'primeng/api';
import { showError } from '../../../utils/message-utils';

@Component({
  selector: 'app-login',
  imports: [
    NgIcon,
    AppLogo,
    ReactiveFormsModule,
    FormsModule
  ],
  template: `
    <div class="auth-box overflow-hidden align-items-center d-flex">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xxl-4 col-md-6 col-sm-8">
            <div class="card">
              <div class="card-body">
                <div class="auth-brand mb-4">
                  <app-logo [logoMaxWidth]="180" [showText]="false"/>
                </div>

                <div class="">
                  <form [formGroup]="loginForm" (ngSubmit)="login()">
                    <div class="mb-3">
                      <label for="mail" class="form-label">Email <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <input
                          formControlName="mail"
                          type="text"
                          class="form-control"
                          id="mail"
                          placeholder="Email"
                          [class.is-invalid]="get('mail')?.invalid && get('mail')?.touched"
                          required
                        />
                      </div>
                      @if (get('mail')?.invalid && get('mail')?.touched) {
                        @if (get('mail')?.errors?.['required']) {
                          <div class="invalid-feedback d-block">Debe ingresar un Email valido.</div>
                        }
                      }
                    </div>

                    <div class="mb-3">
                      <label for="userPassword" class="form-label"
                        >Contraseña <span class="text-danger">*</span></label
                      >
                      <div class="input-group">
                        <input
                          formControlName="password"
                          [type]="showPassword ? 'text' : 'password'"
                          class="form-control"
                          id="userPassword"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          class="btn btn-light btn-icon"
                          type="button"
                          (click)="togglePassword()"
                        >
                          <ng-icon
                            name="lucideEye"
                            [class.d-block]="showPassword"
                            [class.d-none]="!showPassword"
                          ></ng-icon>
                          <ng-icon
                            name="lucideEyeClosed"
                            [class.d-block]="!showPassword"
                            [class.d-none]="showPassword"
                          ></ng-icon>
                        </button>
                      </div>
                    </div>

                    <div
                      class="d-flex justify-content-between align-items-center mb-3"
                    >
                      <!-- <div class="form-check">
                        <input
                          class="form-check-input form-check-input-light fs-14"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label class="form-check-label" for="rememberMe"
                          >Recordarme</label
                        >
                      </div> -->
                      <!-- <a
                        routerLink="/auth/reset-password"
                        class="text-decoration-underline link-offset-3 text-muted"
                        >Forgot Password?</a
                      > -->
                    </div>

                    <div class="d-grid">
                      <button
                        type="submit"
                        class="btn btn-primary fw-semibold py-2"
                      >
                        Iniciar Sesion
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `    
    .auth-box {
      min-height: 100vh;
      background-color: #0f1724;
      background-image: 
        radial-gradient(at 40% 20%, rgba(11, 102, 183, 0.15) 0px, transparent 50%),
        radial-gradient(at 80% 0%, rgba(11, 102, 183, 0.1) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(11, 102, 183, 0.05) 0px, transparent 50%);
      
      .card {
        background-color: #1a2332;
        border: 1px solid #2b3440;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
        
        .card-body {
          padding: 2.5rem;
        }
      }
      
      .auth-brand {
        text-align: center;
      }
      
      .form-label {
        color: #e6eef6;
        font-weight: 500;
      }
      
      .form-control {
        background-color: #111827;
        border-color: #2b3440;
        color: #e6eef6;
        
        &:focus {
          background-color: #111827;
          border-color: #0b66b7;
          color: #e6eef6;
          box-shadow: 0 0 0 0.25rem rgba(11, 102, 183, 0.25);
        }
        
        &::placeholder {
          color: #6b7280;
        }
      }
      
      .btn-light {
        background-color: #2b3440;
        border-color: #2b3440;
        color: #9fb3c8;
        
        &:hover {
          background-color: #3a4556;
          border-color: #3a4556;
          color: #e6eef6;
        }
      }
      
      .btn-primary {
        background-color: #0b66b7;
        border-color: #0b66b7;
        
        &:hover {
          background-color: #094d8a;
          border-color: #094d8a;
        }
      }
      
      .invalid-feedback {
        color: #dc2626;
      }
      
      .text-danger {
        color: #dc2626 !important;
      }
    }
  `,
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private rutActiva = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  showPassword: boolean = false
  cargando:boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  loginForm = new FormGroup({
    mail: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required ]),
  });

  login() {
    if (this.loginForm.valid) {
      // const recordar = (document.getElementById('rememberMe') as HTMLInputElement).checked || false;

      this.cargando = true;
      this.authService.login(this.loginForm.value).pipe(
        finalize(() => this.cargando = false)
      ).subscribe({
        next: () => {
          this.loginOk()
        },
        error: (err) => {
          // this.mostrarError('Credenciales inválidas')  // podés mostrar un toast, mensaje, etc.
          console.error(err)
          showError(this.messageService, 'Error', 'Credenciales inválidas');
        },
      })
    }
  }

  loginOk() {
    let returnUrl = this.rutActiva.snapshot.queryParams['returnUrl'];
    // console.log('returnUrl:', returnUrl);
    this.router.navigateByUrl(returnUrl || '/admin');
  }

  get(campo: string): AbstractControl | null {
    return this.loginForm.get(campo);
  }
}
