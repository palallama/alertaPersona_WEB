import { Component, Input } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a [routerLink]="link" class="logo-light" style="text-decoration: none;">
      <div class="flex items-center space-x-2 my-2">
        <img src="assets/images/Logo.svg" alt="Logo" [style.max-width.px]="logoMaxWidth">
        @if (showText) {
          <span class="font-semibold text-white text-lg ml-3" style="width: 190px;">Alerta Persona</span>
        }
      </div>
    </a>
  `,
  styles: ``,
})
export class AppLogo {
  @Input() logoMaxWidth: number = 140;
  @Input() showText: boolean = true;
  @Input() link: string = '/';
}