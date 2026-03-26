import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CfmStatusChipComponent } from "./status-chip.component";
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function CfmSyncStateComponent_small_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.note);
} }
export class CfmSyncStateComponent {
    title = "État de synchronisation";
    label;
    detail;
    note = "";
    tone = "calm";
    static ɵfac = function CfmSyncStateComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CfmSyncStateComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CfmSyncStateComponent, selectors: [["cfm-sync-state"]], inputs: { title: "title", label: "label", detail: "detail", note: "note", tone: "tone" }, standalone: true, features: [i0.ɵɵStandaloneFeature], decls: 8, vars: 6, consts: [[1, "sync-state"], [3, "label", "tone"], [1, "copy"], [4, "ngIf"]], template: function CfmSyncStateComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵelement(1, "cfm-status-chip", 1);
            i0.ɵɵelementStart(2, "div", 2)(3, "strong");
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p");
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(7, CfmSyncStateComponent_small_7_Template, 2, 1, "small", 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵattribute("data-tone", ctx.tone);
            i0.ɵɵadvance();
            i0.ɵɵproperty("label", ctx.label)("tone", ctx.tone);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.title);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.detail);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.note);
        } }, dependencies: [CommonModule, i1.NgIf, CfmStatusChipComponent], styles: ["[_nghost-%COMP%] {\n        display: block;\n      }\n\n      .sync-state[_ngcontent-%COMP%] {\n        position: relative;\n        display: grid;\n        gap: 0.6rem;\n        padding: 1rem 1.05rem 1rem 1.15rem;\n        border-radius: 22px;\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 70%, transparent);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 249, 249, 0.9));\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .sync-state[_ngcontent-%COMP%]::before {\n        content: \"\";\n        position: absolute;\n        left: 0;\n        top: 1rem;\n        bottom: 1rem;\n        width: 4px;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.24;\n      }\n\n      .sync-state[data-tone=\"neutral\"][_ngcontent-%COMP%] {\n        color: #3f5762;\n      }\n\n      .sync-state[data-tone=\"calm\"][_ngcontent-%COMP%] {\n        color: #1e5d54;\n      }\n\n      .sync-state[data-tone=\"progress\"][_ngcontent-%COMP%] {\n        color: #8f5e00;\n      }\n\n      .sync-state[data-tone=\"success\"][_ngcontent-%COMP%] {\n        color: #1d6a3d;\n      }\n\n      .sync-state[data-tone=\"warning\"][_ngcontent-%COMP%], \n   .sync-state[data-tone=\"danger\"][_ngcontent-%COMP%] {\n        color: #8a2d2d;\n      }\n\n      .copy[_ngcontent-%COMP%] {\n        display: grid;\n        gap: 0.3rem;\n      }\n\n      strong[_ngcontent-%COMP%], \n   p[_ngcontent-%COMP%], \n   small[_ngcontent-%COMP%] {\n        margin: 0;\n      }\n\n      strong[_ngcontent-%COMP%] {\n        color: var(--cfm-color-ink, #10222b);\n      }\n\n      p[_ngcontent-%COMP%], \n   small[_ngcontent-%COMP%] {\n        color: var(--cfm-color-copy-muted, #4c6471);\n        line-height: 1.5;\n      }"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CfmSyncStateComponent, [{
        type: Component,
        args: [{ selector: "cfm-sync-state", standalone: true, imports: [CommonModule, CfmStatusChipComponent], template: `
    <section class="sync-state" [attr.data-tone]="tone">
      <cfm-status-chip [label]="label" [tone]="tone" />
      <div class="copy">
        <strong>{{ title }}</strong>
        <p>{{ detail }}</p>
        <small *ngIf="note">{{ note }}</small>
      </div>
    </section>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["\n      :host {\n        display: block;\n      }\n\n      .sync-state {\n        position: relative;\n        display: grid;\n        gap: 0.6rem;\n        padding: 1rem 1.05rem 1rem 1.15rem;\n        border-radius: 22px;\n        border: 1px solid color-mix(in srgb, var(--cfm-color-border, #bfd3cf) 70%, transparent);\n        background:\n          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 249, 249, 0.9));\n        box-shadow:\n          0 14px 30px rgba(18, 33, 42, 0.06),\n          inset 0 1px 0 rgba(255, 255, 255, 0.84);\n      }\n\n      .sync-state::before {\n        content: \"\";\n        position: absolute;\n        left: 0;\n        top: 1rem;\n        bottom: 1rem;\n        width: 4px;\n        border-radius: 999px;\n        background: currentColor;\n        opacity: 0.24;\n      }\n\n      .sync-state[data-tone=\"neutral\"] {\n        color: #3f5762;\n      }\n\n      .sync-state[data-tone=\"calm\"] {\n        color: #1e5d54;\n      }\n\n      .sync-state[data-tone=\"progress\"] {\n        color: #8f5e00;\n      }\n\n      .sync-state[data-tone=\"success\"] {\n        color: #1d6a3d;\n      }\n\n      .sync-state[data-tone=\"warning\"],\n      .sync-state[data-tone=\"danger\"] {\n        color: #8a2d2d;\n      }\n\n      .copy {\n        display: grid;\n        gap: 0.3rem;\n      }\n\n      strong,\n      p,\n      small {\n        margin: 0;\n      }\n\n      strong {\n        color: var(--cfm-color-ink, #10222b);\n      }\n\n      p,\n      small {\n        color: var(--cfm-color-copy-muted, #4c6471);\n        line-height: 1.5;\n      }\n    "] }]
    }], null, { title: [{
            type: Input
        }], label: [{
            type: Input,
            args: [{ required: true }]
        }], detail: [{
            type: Input,
            args: [{ required: true }]
        }], note: [{
            type: Input
        }], tone: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CfmSyncStateComponent, { className: "CfmSyncStateComponent" }); })();
