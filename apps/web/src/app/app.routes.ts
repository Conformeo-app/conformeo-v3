import { inject } from "@angular/core";
import type { ModuleCode } from "@conformeo/contracts";
import { type CanActivateChildFn, type CanActivateFn, Router, type Routes } from "@angular/router";

import { clearSession, fetchSession, getHydratedSession, getStoredAccessToken, getStoredOrganizationId } from "./auth-client";
import { ApiClientError } from "./api-error";
import { DesktopHomePageComponent } from "./desktop-home-page.component";
import { DesktopLoginPageComponent } from "./desktop-login-page.component";
import { DesktopShellComponent } from "./desktop-shell.component";
import { DesktopWorksiteDocumentsPageComponent } from "./desktop-worksite-documents-page.component";
import { DesktopWorkspacePageComponent } from "./desktop-workspace-page.component";

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

const moduleEnabledGuard = (moduleCode: ModuleCode): CanActivateFn => {
  return async () => {
    const router = inject(Router);
    const accessToken = getStoredAccessToken();
    const organizationId = getStoredOrganizationId();

    if (!accessToken) {
      return router.parseUrl("/login");
    }

    const hydratedSession = getHydratedSession(accessToken);
    if (hydratedSession) {
      return hydratedSession.current_membership.enabled_modules.includes(moduleCode)
        ? true
        : router.parseUrl("/app/home");
    }

    try {
      const session = await fetchSession(accessToken, organizationId);
      return session.current_membership.enabled_modules.includes(moduleCode)
        ? true
        : router.parseUrl("/app/home");
    } catch (error) {
      const shouldClearAuth =
        error instanceof ApiClientError
        && (error.status === 401 || error.status === 403);

      if (shouldClearAuth) {
        clearSession(`module guard ${moduleCode} received ${error.status}`);
        return router.parseUrl("/login");
      }

      console.error("[routing] module guard fallback after session refresh failure.", {
        moduleCode,
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
        path: "reglementation",
        component: DesktopWorkspacePageComponent,
        canActivate: [moduleEnabledGuard("reglementation")],
        data: { template: "reglementation" },
      },
      {
        path: "chantier",
        canActivate: [moduleEnabledGuard("chantier")],
        children: [
          {
            path: "",
            pathMatch: "full",
            component: DesktopWorkspacePageComponent,
            data: { template: "chantier" },
          },
          {
            path: "documents",
            component: DesktopWorksiteDocumentsPageComponent,
          },
          {
            path: "coordination",
            component: DesktopWorkspacePageComponent,
            data: { template: "coordination" },
          },
        ],
      },
      {
        path: "facturation",
        component: DesktopWorkspacePageComponent,
        canActivate: [moduleEnabledGuard("facturation")],
        data: { template: "facturation" },
      },
    ],
  },
  {
    path: "**",
    redirectTo: "login",
  },
];
