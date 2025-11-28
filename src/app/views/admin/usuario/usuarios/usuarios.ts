import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario as IUsuario } from '@core/interfaces/usuario';
import { UsuarioService } from '@core/services/usuario.service';
import { Navbar } from "../../components/navbar/navbar";
import { Footer } from "src/app/components/footer";
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucidePlus, lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { UsuarioFormComponent } from '../usuario/usuario';
import { IdAPPipe } from '@core/pipes/id-ap-pipe';
import { finalize } from 'rxjs';

export type UsuarioFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, Navbar, Footer, TableModule, ButtonModule, InputTextModule, TagModule, ToastModule, TooltipModule, ConfirmDialogModule, NgIconComponent, IdAPPipe],
  providers: [MessageService, ConfirmationService, DialogService, provideIcons({ lucideSearch, lucidePlus, lucideEye, lucidePencil, lucideTrash2 })],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  
  private dialogRef: DynamicDialogRef | null = null;

  usersList: IUsuario[] = [];
  filteredUsers: IUsuario[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.usuarioService.getUsuarios().pipe(
      finalize(() => { 
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data: any) => {
        this.usersList = data as IUsuario[];
        this.filteredUsers = [...this.usersList];
      },
      error: (_err: any) => {
        this.showToast('No se pudieron cargar los usuarios desde la API', 'error');
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.usersList.filter(u =>
      u.nombre.toLowerCase().includes(term) || u.mail.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    const ref = this.dialogService.open(UsuarioFormComponent, {
      header: 'Nuevo Usuario',
      width: '600px',
      modal: true,
      data: {
        mode: 'create' as UsuarioFormMode
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    if (ref) {
      ref.onClose.subscribe((result) => {
        if (result) {
          setTimeout(() => this.fetchUsers(), 0);
        }
      });
    }
  }

  openEditModal(user: IUsuario): void {
    const ref = this.dialogService.open(UsuarioFormComponent, {
      header: 'Editar Usuario',
      width: '600px',
      modal: true,
      data: {
        mode: 'edit' as UsuarioFormMode,
        user: user
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    if (ref) {
      ref.onClose.subscribe((result) => {
        if (result) {
          setTimeout(() => this.fetchUsers(), 0);
        }
      });
    }
  }

  deleteUser(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este usuario?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.deleteUsuario(id).subscribe({
          next: () => {
            this.showToast('Usuario eliminado exitosamente', 'warn');
            this.fetchUsers();
          },
          error: (_err: any) => {
            this.showToast('Error al eliminar usuario', 'error');
          }
        });
      }
    });
  }

  toggleState(user: IUsuario): void {
    if (!user.id) return;
    
    const action = user.activo ? 'desactivar' : 'activar';
    const message = user.activo ? '¿Desactivar este usuario?' : '¿Activar este usuario?';
    
    this.confirmationService.confirm({
      message: message,
      header: 'Confirmar Acción',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        const observable = user.activo 
          ? this.usuarioService.desactivarUsuario(user.id!)
          : this.usuarioService.activarUsuario(user.id!);
        
        observable.subscribe({
          next: () => {
            this.showToast(`Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`, 'info');
            this.fetchUsers();
          },
          error: (_err: any) => {
            this.showToast('Error al cambiar estado', 'error');
          }
        });
      }
    });
  }

  toggleValid(user: IUsuario): void {
    if (!user.id) return;
    
    const action = user.validado ? 'invalidar' : 'validar';
    const message = user.validado ? '¿Invalidar este usuario?' : '¿Validar este usuario?';
    
    this.confirmationService.confirm({
      message: message,
      header: 'Confirmar Acción',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        const observable = user.validado 
          ? this.usuarioService.invalidarUsuario(user.id!)
          : this.usuarioService.validarUsuario(user.id!);
        
        observable.subscribe({
          next: () => {
            this.showToast(`Usuario ${action === 'validar' ? 'validado' : 'invalidado'} exitosamente`, 'info');
            this.fetchUsers();
          },
          error: (_err: any) => {
            this.showToast('Error al cambiar estado', 'error');
          }
        });
      }
    });
  }

  viewProfile(user: IUsuario): void {
    this.dialogService.open(UsuarioFormComponent, {
      header: 'Perfil de Usuario',
      width: '600px',
      modal: true,
      closable: true,
      data: {
        mode: 'view' as UsuarioFormMode,
        user: user
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
  }

  showToast(message: string, severity: 'success' | 'info' | 'warn' | 'error' = 'info'): void {
    const summaryMap = {
      'success': 'Éxito',
      'info': 'Información',
      'warn': 'Advertencia',
      'error': 'Error'
    };
    
    this.messageService.add({
      severity: severity,
      summary: summaryMap[severity],
      detail: message,
      life: 3000
    });
  }
  
  ngOnDestroy(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
  
  getEventValue($event:any) :string {
    return $event.target.value;
  } 
}
