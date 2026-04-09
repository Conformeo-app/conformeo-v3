import type { Routes } from "@angular/router";

import { DesktopWorksitesLayoutComponent } from "./desktop-worksites-layout.component";

export const DESKTOP_WORKSITES_ROUTES: Routes = [
  {
    path: "",
    component: DesktopWorksitesLayoutComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "liste",
      },
      {
        path: "liste",
        loadComponent: () =>
          import("./desktop-worksites-list-page.component").then((module) => module.DesktopWorksitesListPageComponent),
      },
      {
        path: "nouveau",
        loadComponent: () =>
          import("./desktop-worksites-create-page.component").then((module) => module.DesktopWorksitesCreatePageComponent),
      },
      {
        path: "parc",
        loadComponent: () =>
          import("./desktop-worksite-equipment-park-page.component").then((module) => module.DesktopWorksiteEquipmentParkPageComponent),
      },
      {
        path: ":worksiteId",
        loadComponent: () =>
          import("./desktop-worksite-detail-layout.component").then((module) => module.DesktopWorksiteDetailLayoutComponent),
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "apercu",
          },
          {
            path: "apercu",
            loadComponent: () =>
              import("./desktop-worksite-overview-page.component").then((module) => module.DesktopWorksiteOverviewPageComponent),
          },
          {
            path: "dossier",
            loadComponent: () =>
              import("./desktop-worksite-client-dossier-page.component").then((module) => module.DesktopWorksiteClientDossierPageComponent),
          },
          {
            path: "documents",
            loadComponent: () =>
              import("./desktop-worksite-documents-view.component").then((module) => module.DesktopWorksiteDocumentsViewComponent),
          },
          {
            path: "preuves",
            loadComponent: () =>
              import("./desktop-worksite-proofs-page.component").then((module) => module.DesktopWorksiteProofsPageComponent),
          },
          {
            path: "coordination",
            loadComponent: () =>
              import("./desktop-worksite-coordination-page.component").then((module) => module.DesktopWorksiteCoordinationPageComponent),
          },
          {
            path: "equipements",
            loadComponent: () =>
              import("./desktop-worksite-equipment-page.component").then((module) => module.DesktopWorksiteEquipmentPageComponent),
          },
        ],
      },
    ],
  },
];
