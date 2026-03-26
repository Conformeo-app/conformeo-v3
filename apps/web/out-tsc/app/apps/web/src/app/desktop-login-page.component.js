import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CfmButtonComponent, CfmCardComponent, CfmInputComponent, } from "@conformeo/ui";
import { DESKTOP_LOGIN_PAGE_CONTEXT } from "./desktop-login-page-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
function DesktopLoginPageComponent_p_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.ctx.errorMessage);
} }
export class DesktopLoginPageComponent {
    ctx = inject(DESKTOP_LOGIN_PAGE_CONTEXT);
    static ɵfac = function DesktopLoginPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopLoginPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopLoginPageComponent, selectors: [["cfm-desktop-login-page"]], standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 7, vars: 6, consts: [["eyebrow", "Conformeo Desktop", "title", "Connexion", "description", "Acc\u00E9dez \u00E0 l\u2019espace bureau pour initialiser l\u2019entreprise, pr\u00E9parer le p\u00E9rim\u00E8tre r\u00E9glementaire et g\u00E9rer les premiers sites.", 1, "desktop-card"], [1, "auth-form", 3, "ngSubmit"], ["name", "email", "type", "email", "autocomplete", "username", "label", "Email", "placeholder", "prenom.nom@entreprise.fr", "required", "", 3, "ngModelChange", "ngModel"], ["name", "password", "type", "password", "autocomplete", "current-password", "label", "Mot de passe", "placeholder", "Mot de passe", "required", "", 3, "ngModelChange", "ngModel"], ["type", "submit", 3, "disabled", "block"], ["class", "feedback error", 4, "ngIf"], [1, "feedback", "error"]], template: function DesktopLoginPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "cfm-card", 0)(1, "form", 1);
            i0.ɵɵlistener("ngSubmit", function DesktopLoginPageComponent_Template_form_ngSubmit_1_listener() { return ctx.ctx.submitLogin(); });
            i0.ɵɵelementStart(2, "cfm-input", 2);
            i0.ɵɵtwoWayListener("ngModelChange", function DesktopLoginPageComponent_Template_cfm_input_ngModelChange_2_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.ctx.email, $event) || (ctx.ctx.email = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "cfm-input", 3);
            i0.ɵɵtwoWayListener("ngModelChange", function DesktopLoginPageComponent_Template_cfm_input_ngModelChange_3_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.ctx.password, $event) || (ctx.ctx.password = $event); return $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "cfm-button", 4);
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(6, DesktopLoginPageComponent_p_6_Template, 2, 1, "p", 5);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.ctx.email);
            i0.ɵɵadvance();
            i0.ɵɵtwoWayProperty("ngModel", ctx.ctx.password);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.ctx.loading)("block", true);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.ctx.loading ? "Connexion en cours" : "Se connecter", " ");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.ctx.errorMessage);
        } }, dependencies: [CommonModule, i1.NgIf, FormsModule, i2.ɵNgNoValidate, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.NgModel, i2.NgForm, CfmButtonComponent,
            CfmCardComponent,
            CfmInputComponent], styles: ["[_nghost-%COMP%] {\n        min-height: 100vh;\n        display: grid;\n        place-items: center;\n        padding: 2rem;\n        background:\n          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .desktop-card[_ngcontent-%COMP%] {\n        width: min(460px, 100%);\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopLoginPageComponent, [{
        type: Component,
        args: [{ selector: "cfm-desktop-login-page", standalone: true, imports: [
                    CommonModule,
                    FormsModule,
                    CfmButtonComponent,
                    CfmCardComponent,
                    CfmInputComponent,
                ], template: `
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
  `, styles: ["\n      :host {\n        min-height: 100vh;\n        display: grid;\n        place-items: center;\n        padding: 2rem;\n        background:\n          radial-gradient(circle at top, rgba(245, 188, 88, 0.16), transparent 22%),\n          linear-gradient(180deg, #f7f2e9 0%, #eef4f1 100%);\n      }\n\n      .desktop-card {\n        width: min(460px, 100%);\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopLoginPageComponent, { className: "DesktopLoginPageComponent" }); })();
