import type { Routes } from "@angular/router";

import { DesktopRegulationLayoutComponent } from "./desktop-regulation-layout.component";

export const DESKTOP_REGULATION_ROUTES: Routes = [
  {
    path: "",
    component: DesktopRegulationLayoutComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "synthese",
      },
      {
        path: "synthese",
        loadComponent: () =>
          import("./desktop-regulation-summary-page.component").then((module) => module.DesktopRegulationSummaryPageComponent),
      },
      {
        path: "obligations",
        loadComponent: () =>
          import("./desktop-regulation-obligations-page.component").then(
            (module) => module.DesktopRegulationObligationsPageComponent
          ),
      },
      {
        path: "preuves",
        loadComponent: () =>
          import("./desktop-regulation-evidence-page.component").then(
            (module) => module.DesktopRegulationEvidencePageComponent
          ),
      },
      {
        path: "sites",
        loadComponent: () =>
          import("./desktop-regulation-sites-page.component").then((module) => module.DesktopRegulationSitesPageComponent),
      },
      {
        path: "exports",
        loadComponent: () =>
          import("./desktop-regulation-exports-page.component").then((module) => module.DesktopRegulationExportsPageComponent),
      },
    ],
  },
];
