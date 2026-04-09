import { inject } from "@angular/core";
import type { ModuleCode } from "@conformeo/contracts";
import { type CanActivateChildFn, type CanActivateFn, Router, type Routes } from "@angular/router";

import { clearSession, fetchSession, getHydratedSession, getStoredAccessToken, getStoredOrganizationId } from "./auth-client";
import { ApiClientError } from "./api-error";
import { DesktopHomePageComponent } from "./desktop-home-page.component";
import { DesktopLoginPageComponent } from "./desktop-login-page.component";
import { DesktopShellComponent } from "./desktop-shell.component";

function requirePersistedAuth(source: "canActivate" | "canActivateChild") {
  const router = inject(Router);
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    console.warn("[auth] persisted token missing for protected route.", {
      source,
      redirectTo: "/login",
    });
    return router.parseUrl("/login");
  }

  return true;
}

const authGuard: CanActivateFn = () => requirePersistedAuth("canActivate");
const authChildGuard: CanActivateChildFn = () => requirePersistedAuth("canActivateChild");

const moduleEnabledGuard = (moduleCode: ModuleCode | ModuleCode[]): CanActivateFn => {
  return async () => {
    const router = inject(Router);
    const accessToken = getStoredAccessToken();
    const organizationId = getStoredOrganizationId();
    const moduleCodes = Array.isArray(moduleCode) ? moduleCode : [moduleCode];

    if (!accessToken) {
      return router.parseUrl("/login");
    }

    const hydratedSession = getHydratedSession(accessToken);
    if (hydratedSession) {
      return moduleCodes.some((code) => hydratedSession.current_membership.enabled_modules.includes(code))
        ? true
        : router.parseUrl("/app/home");
    }

    try {
      const session = await fetchSession(accessToken, organizationId);
      return moduleCodes.some((code) => session.current_membership.enabled_modules.includes(code))
        ? true
        : router.parseUrl("/app/home");
    } catch (error) {
      const shouldClearAuth =
        error instanceof ApiClientError
        && (error.status === 401 || error.status === 403);

      if (shouldClearAuth) {
        clearSession(`module guard ${moduleCodes.join(",")} received ${error.status}`);
        return router.parseUrl("/login");
      }

      console.error("[routing] module guard fallback after session refresh failure.", {
        moduleCode: moduleCodes,
        error,
      });
      return router.parseUrl("/app/home");
    }
  };
};

export const APP_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "login",
  },
  {
    path: "login",
    component: DesktopLoginPageComponent,
  },
  {
    path: "app",
    component: DesktopShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "home",
      },
      {
        path: "home",
        component: DesktopHomePageComponent,
      },
      {
        path: "documents",
        canActivate: [moduleEnabledGuard(["chantier", "reglementation", "facturation"])],
        loadComponent: () =>
          import("./desktop-documents-page.component").then((module) => module.DesktopDocumentsPageComponent),
      },
      {
        path: "administration",
        loadChildren: () =>
          import("./desktop-admin.routes").then((module) => module.DESKTOP_ADMIN_ROUTES),
      },
      {
        path: "reglementation",
        canActivate: [moduleEnabledGuard("reglementation")],
        loadChildren: () =>
          import("./desktop-regulation.routes").then((module) => module.DESKTOP_REGULATION_ROUTES),
      },
      {
        path: "chantier",
        pathMatch: "full",
        redirectTo: "chantiers",
      },
      {
        path: "chantier/documents",
        pathMatch: "full",
        redirectTo: "documents",
      },
      {
        path: "chantier/coordination",
        pathMatch: "full",
        redirectTo: "chantiers/liste",
      },
      {
        path: "chantier/:worksiteId",
        redirectTo: "chantiers/:worksiteId/apercu",
      },
      {
        path: "chantiers",
        canActivate: [moduleEnabledGuard("chantier")],
        loadChildren: () => import("./desktop-worksites.routes").then((module) => module.DESKTOP_WORKSITES_ROUTES),
      },
      {
        path: "facturation",
        canActivate: [moduleEnabledGuard("facturation")],
        loadChildren: () =>
          import("./desktop-billing.routes").then((module) => module.DESKTOP_BILLING_ROUTES),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "login",
  },
];
