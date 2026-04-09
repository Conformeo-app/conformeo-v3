import type { Routes } from "@angular/router";

import { DesktopBillingLayoutComponent } from "./desktop-billing-layout.component";

export const DESKTOP_BILLING_ROUTES: Routes = [
  {
    path: "",
    component: DesktopBillingLayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./desktop-billing-home-page.component").then((module) => module.DesktopBillingHomePageComponent),
      },
      {
        path: "clients",
        loadComponent: () =>
          import("./desktop-billing-customers-page.component").then((module) => module.DesktopBillingCustomersPageComponent),
      },
      {
        path: "devis",
        loadComponent: () =>
          import("./desktop-billing-quotes-page.component").then((module) => module.DesktopBillingQuotesPageComponent),
      },
      {
        path: "factures",
        loadComponent: () =>
          import("./desktop-billing-invoices-page.component").then((module) => module.DesktopBillingInvoicesPageComponent),
      },
      {
        path: "relances",
        loadComponent: () =>
          import("./desktop-billing-followups-page.component").then((module) => module.DesktopBillingFollowupsPageComponent),
      },
      {
        path: "exports",
        loadComponent: () =>
          import("./desktop-billing-exports-page.component").then((module) => module.DesktopBillingExportsPageComponent),
      },
    ],
  },
];
