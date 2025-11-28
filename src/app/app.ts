import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import * as lucideIcons from '@ng-icons/lucide'
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [
    MessageService
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  viewProviders: [
    provideIcons({ ...lucideIcons }),
  ],
})
export class App {
  protected readonly title = signal('alerta-persona');
}
