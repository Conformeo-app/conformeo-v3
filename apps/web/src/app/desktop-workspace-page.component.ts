import { CommonModule } from "@angular/common";
import { Component, TemplateRef, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import {
  DESKTOP_SHELL_CONTEXT,
  type DesktopShellContext,
  type WorkspaceTemplateName,
} from "./desktop-shell-context";

@Component({
  selector: "cfm-desktop-workspace-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page">
      <ng-container *ngIf="templateRef as template" [ngTemplateOutlet]="template"></ng-container>
    </section>
  `,
})
export class DesktopWorkspacePageComponent {
  private readonly shell = inject(DESKTOP_SHELL_CONTEXT);
  private readonly route = inject(ActivatedRoute);

  get templateRef(): TemplateRef<unknown> | null {
    return this.shell.getWorkspaceTemplate(this.route.snapshot.data["template"] as WorkspaceTemplateName);
  }
}
