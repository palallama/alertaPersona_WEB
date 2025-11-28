import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Password } from 'primeng/password';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideX } from '@ng-icons/lucide';
import { Usuario as IUsuario } from '@core/interfaces/usuario';
import { UsuarioService } from '@core/services/usuario.service';
import { MessageService } from 'primeng/api';

export type UsuarioFormMode = 'create' | 'edit' | 'view';

interface Genero {
  label: string;
  value: string;
}

@Component({
  selector: 'app-usuario-form',
  imports: [
    CommonModule, 
    FormsModule, 
    InputTextModule, 
    ButtonModule, 
    TagModule,
    ToastModule,
    InputMask,
    Select,
    DatePicker,
    Password
  ],
  providers: [MessageService, provideIcons({ lucideCheck, lucideX })],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss',
})
export class UsuarioFormComponent implements OnInit {
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);

  mode: UsuarioFormMode = 'create';
  
  userForm: IUsuario = {
    nombre: '',
    apellido: '',
    nroDocumento: '',
    telefono: '',
    nroTramite: '',
    mail: '',
    password: '',
    genero: '',
    fchNacimiento: undefined
  };

  confirmPassword: string = '';
  showPassword: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;
  maxDate: Date = new Date();

  generos: Genero[] = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'No binario', value: 'X' }
  ];

  ngOnInit(): void {
    if (this.config.data) {
      this.mode = this.config.data.mode || 'create';
      
      if (this.config.data.user) {
        this.userForm = { ...this.config.data.user };
        if (this.userForm.fchNacimiento && typeof this.userForm.fchNacimiento === 'string') {
          this.userForm.fchNacimiento = new Date(this.userForm.fchNacimiento);
        }
      }
    }
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get isCreateMode(): boolean {
    return this.mode === 'create';
  }

  isFieldInvalid(fieldName: keyof IUsuario): boolean {
    if (!this.submitted) return false;
    
    const value = this.userForm[fieldName];
    
    if (fieldName === 'nombre' || fieldName === 'apellido' || fieldName === 'mail') {
      return !value || (typeof value === 'string' && value.trim() === '');
    }
    
    if (fieldName === 'nroDocumento' || fieldName === 'nroTramite') {
      return !value || (typeof value === 'string' && value.trim() === '');
    }

    if (fieldName === 'genero') {
      return !value || value === '';
    }

    if (fieldName === 'fchNacimiento') {
      return !value;
    }
    
    return false;
  }

  isPasswordInvalid(): boolean {
    if (!this.submitted || this.isEditMode) return false;
    return !this.userForm.password || this.userForm.password.trim() === '';
  }

  isConfirmPasswordInvalid(): boolean {
    if (!this.submitted || this.isEditMode) return false;
    return this.confirmPassword !== this.userForm.password;
  }

  onSubmit(): void {
    this.submitted = true;

    // Validar campos requeridos
    if (this.isFieldInvalid('nombre') || 
        this.isFieldInvalid('apellido') || 
        this.isFieldInvalid('mail') ||
        this.isFieldInvalid('nroDocumento') ||
        this.isFieldInvalid('nroTramite') ||
        this.isFieldInvalid('genero') ||
        this.isFieldInvalid('fchNacimiento')) {
      this.showError('Por favor complete todos los campos requeridos');
      return;
    }

    // Validar contraseñas en modo creación
    if (this.isCreateMode) {
      if (this.isPasswordInvalid()) {
        this.showError('La contraseña es requerida');
        return;
      }
      if (this.isConfirmPasswordInvalid()) {
        this.showError('Las contraseñas no coinciden');
        return;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userForm.mail)) {
      this.showError('El email no es válido');
      return;
    }

    // Validar que nroDocumento y nroTramite contengan solo números
    let nroDocStr = String(this.userForm.nroDocumento).trim();
    const nroTramiteStr = String(this.userForm.nroTramite).trim();

    nroDocStr = nroDocStr.replaceAll('.', '');
    // Validar longitud de nroDocumento (debe ser exactamente 8 caracteres)
    if (nroDocStr.length !== 8) {
      this.showError('El número de documento debe tener exactamente 8 dígitos');
      return;
    }

    // Validar longitud de nroTramite (máximo 11 caracteres)
    if (nroTramiteStr.length === 0) {
      this.showError('El número de trámite es requerido');
      return;
    }
    
    if (nroTramiteStr.length > 11) {
      this.showError('El número de trámite no puede superar los 11 caracteres');
      return;
    }

    this.loading = true;

    // Preparar datos para enviar al backend
    const dataToSend: IUsuario = {
      ...this.userForm,
      nroDocumento: nroDocStr.replaceAll('.', ''),
      nroTramite: nroTramiteStr
    };

    // Eliminar campos que el backend asigna/maneja automáticamente
    delete dataToSend.activo;
    delete dataToSend.validado;
    delete dataToSend.fechaCreacion;
    delete dataToSend.ultimoAcceso;
    delete dataToSend.token;
    delete dataToSend.preferencias;
    delete dataToSend.esAdmin;
    
    // Eliminar id solo en modo creación
    if (this.isCreateMode) {
      delete dataToSend.id;
    }

    const observable = this.isEditMode 
      ? this.usuarioService.updateUsuario(dataToSend)
      : this.usuarioService.insertUsuario(dataToSend);

    observable.subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.loading = false;
        this.showError(err.error?.message || 'Error al guardar el usuario');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }

  getGeneroLabel(value: string): string {
    const genero = this.generos.find(g => g.value === value);
    return genero ? genero.label : value;
  }
}
