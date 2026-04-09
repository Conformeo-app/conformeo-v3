import type { Routes } from "@angular/router";

import { DesktopAdminLayoutComponent } from "./desktop-admin-layout.component";

export const DESKTOP_ADMIN_ROUTES: Routes = [
  {
    path: "",
    component: DesktopAdminLayoutComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "organisation",
      },
      {
        path: "organisation",
        loadComponent: () =>
          import("./desktop-admin-organization-page.component").then((module) => module.DesktopAdminOrganizationPageComponent),
      },
      {
        path: "utilisateurs",
        loadComponent: () =>
          import("./desktop-admin-users-page.component").then((module) => module.DesktopAdminUsersPageComponent),
      },
      {
        path: "equipes",
        loadComponent: () =>
          import("./desktop-admin-teams-page.component").then((module) => module.DesktopAdminTeamsPageComponent),
      },
    ],
  },
];
