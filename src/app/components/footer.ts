import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <!-- Footer -->
    <footer class="admin-footer text-center py-3 border-top mt-5">
      &copy; 2025 Palallama Dev. Alerta Persona. Todos los derechos reservados.
    </footer>
  `,
  styles: `
    .admin-footer {
      background-color: #0e1620;
      color: #9fb3c8;
      border-top-color: #2b3440 !important;
    }
  `,
})
export class Footer {

}
