import { InjectionToken } from "@angular/core";
export interface DesktopLoginPageContext {
    email: string;
    password: string;
    loading: boolean;
    errorMessage: string;
    submitLogin(): Promise<void>;
}
export declare const DESKTOP_LOGIN_PAGE_CONTEXT: InjectionToken<DesktopLoginPageContext>;
//# sourceMappingURL=desktop-login-page-context.d.ts.map