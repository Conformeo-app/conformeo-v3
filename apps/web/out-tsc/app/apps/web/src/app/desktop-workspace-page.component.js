import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DESKTOP_SHELL_CONTEXT, } from "./desktop-shell-context";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function DesktopWorkspacePageComponent_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 2);
} if (rf & 2) {
    const template_r1 = ctx.ngIf;
    i0.ɵɵproperty("ngTemplateOutlet", template_r1);
} }
export class DesktopWorkspacePageComponent {
    shell = inject(DESKTOP_SHELL_CONTEXT);
    route = inject(ActivatedRoute);
    get templateRef() {
        return this.shell.getWorkspaceTemplate(this.route.snapshot.data["template"]);
    }
    static ɵfac = function DesktopWorkspacePageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesktopWorkspacePageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesktopWorkspacePageComponent, selectors: [["cfm-desktop-workspace-page"]], standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 2, vars: 1, consts: [[1, "workspace-page"], [3, "ngTemplateOutlet", 4, "ngIf"], [3, "ngTemplateOutlet"]], template: function DesktopWorkspacePageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵtemplate(1, DesktopWorkspacePageComponent_ng_container_1_Template, 1, 1, "ng-container", 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.templateRef);
        } }, dependencies: [CommonModule, i1.NgIf, i1.NgTemplateOutlet], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesktopWorkspacePageComponent, [{
        type: Component,
        args: [{
                selector: "cfm-desktop-workspace-page",
                standalone: true,
                imports: [CommonModule],
                template: `
    <section class="workspace-page">
      <ng-container *ngIf="templateRef as template" [ngTemplateOutlet]="template"></ng-container>
    </section>
  `,
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesktopWorkspacePageComponent, { className: "DesktopWorkspacePageComponent" }); })();
