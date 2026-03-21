import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmInputComponent,
} from "@conformeo/ui";

import { DESKTOP_LOGIN_PAGE_CONTEXT } from "./desktop-login-page-context";

@Component({
  selector: "cfm-desktop-login-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CfmButtonComponent,
    CfmCardComponent,
    CfmInputComponent,
  ],
  template: `
    <cfm-card
      class="desktop-card"
      eyebrow="Conformeo Desktop"
      title="Connexion"
      description="Accédez à l’espace bureau pour initialiser l’entreprise, préparer le périmètre réglementaire et gérer les premiers sites."
    >
      <form class="auth-form" (ngSubmit)="ctx.submitLogin()">
        <cfm-input
          [(ngModel)]="ctx.email"
          name="email"
          type="email"
          autocomplete="username"
          label="Email"
          placeholder="prenom.nom@entreprise.fr"
          required
        />

        <cfm-input
          [(ngModel)]="ctx.password"
          name="password"
          type="password"
          autocomplete="current-password"
          label="Mot de passe"
          placeholder="Mot de passe"
          required
        />

        <cfm-button type="submit" [disabled]="ctx.loading" [block]="true">
          {{ ctx.loading ? "Connexion en cours" : "Se connecter" }}
        </cfm-button>
      </form>

      <p class="feedback error" *ngIf="ctx.errorMessage">{{ ctx.errorMessage }}</p>
    </cfm-card>
  `,
  styles: [
    `
      :host {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background:
          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),
          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);
      }

      .desktop-card {
        width: min(460px, 100%);
      }
    `,
  ],
})
export class DesktopLoginPageComponent {
  readonly ctx = inject(DESKTOP_LOGIN_PAGE_CONTEXT);
}
