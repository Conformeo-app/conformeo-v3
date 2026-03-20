import { InjectionToken } from "@angular/core";

export interface DesktopLoginPageContext {
  email: string;
  password: string;
  loading: boolean;
  errorMessage: string;
  submitLogin(): Promise<void>;
}

export const DESKTOP_LOGIN_PAGE_CONTEXT =
  new InjectionToken<DesktopLoginPageContext>("DESKTOP_LOGIN_PAGE_CONTEXT");
