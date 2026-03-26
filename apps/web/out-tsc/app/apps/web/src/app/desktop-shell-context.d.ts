import { InjectionToken, TemplateRef } from "@angular/core";
import type { AuthSession, MembershipAccess, ModuleCode, OrganizationSiteRecord, OrganizationSiteType } from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";
export type DesktopNavigationItem = {
    route: string;
    label: string;
    tone: CfmTone;
};
export type WorkspaceTemplateName = "home" | "reglementation" | "chantier" | "facturation" | "coordination";
export type DesktopHomeKpiCard = {
    id: string;
    label: string;
    value: string;
    detail: string;
    statusLabel: string;
    tone: CfmTone;
};
export type DesktopHomeAlertItem = {
    id: string;
    title: string;
    description: string;
    moduleLabel: string;
    tone: CfmTone;
    priority: number;
};
export type DesktopHomeOverviewCard = {
    id: string;
    label: string;
    headline: string;
    detail: string;
    highlights: Array<{
        id: string;
        label: string;
        value: string;
    }>;
    statusLabel: string;
    tone: CfmTone;
};
export type DesktopHomeWorksiteItem = {
    id: string;
    name: string;
    summary: string;
    operationalSummary: string;
    taskSummary: string;
    linkedWorksiteDocumentsSummary: string;
    financialSummary: string | null;
    regulatorySummary: string | null;
    statusLabel: string;
    statusTone: CfmTone;
    signalLabel: string;
    signalTone: CfmTone;
};
export type DesktopHomeCoordinationTodoItem = {
    id: string;
    title: string;
    description: string;
    context: string | null;
    kindLabel: string;
    kindTone: CfmTone;
    statusLabel: string;
    statusTone: CfmTone;
};
export type DesktopHomeCustomerItem = {
    id: string;
    name: string;
    summary: string;
    context: string;
    statusLabel: string;
    statusTone: CfmTone;
    signalLabel: string;
    signalTone: CfmTone;
};
export type DesktopHomeSiteEnrichmentState = {
    label: string;
    tone: CfmTone;
    detail: string;
    reasonLabel: string | null;
    retryLabel: string;
    showRetryAsPrimary: boolean;
};
export type DesktopHomeSiteCreateDraft = {
    name: string;
    address: string;
    siteType: OrganizationSiteType;
};
export interface DesktopShellContext {
    readonly currentMembership: MembershipAccess | null;
    readonly session: AuthSession | null;
    selectedOrganizationId: string | null;
    readonly desktopNavigationItems: DesktopNavigationItem[];
    readonly errorMessage: string;
    readonly feedbackMessage: string;
    readonly isWorkspaceRefreshing: boolean;
    readonly dashboardKpis: DesktopHomeKpiCard[];
    readonly dashboardAlerts: DesktopHomeAlertItem[];
    readonly dashboardEnterpriseOverviewCards: DesktopHomeOverviewCard[];
    readonly filteredDashboardWorksiteOverviewItems: DesktopHomeWorksiteItem[];
    readonly worksiteOverviewCountLabel: string;
    readonly coordinationTodoItems: DesktopHomeCoordinationTodoItem[];
    readonly coordinationTodoCountLabel: string;
    readonly dashboardCustomerOverviewItems: DesktopHomeCustomerItem[];
    readonly customerOverviewCountLabel: string;
    readonly canManageOrganization: boolean;
    readonly organizationSiteSaving: boolean;
    readonly organizationSiteEnrichmentBusyId: string | null;
    readonly homeSiteQuickCreateOpen: boolean;
    readonly organizationSites: OrganizationSiteRecord[];
    readonly siteForm: DesktopHomeSiteCreateDraft;
    readonly canCreateSite: boolean;
    getWorkspaceTemplate(name: WorkspaceTemplateName): TemplateRef<unknown> | null;
    getModuleNavigationLabel(moduleCode: ModuleCode): string;
    getSiteTypeLabel(siteType: OrganizationSiteType): string;
    getSiteEnrichmentUiState(site: OrganizationSiteRecord): DesktopHomeSiteEnrichmentState;
    openHomeSiteQuickCreate(): void;
    closeHomeSiteQuickCreate(): void;
    createSite(): Promise<void>;
    relaunchSiteEnrichment(site: OrganizationSiteRecord): Promise<void>;
    changeOrganization(): Promise<void>;
    logout(): void;
}
export declare const DESKTOP_SHELL_CONTEXT: InjectionToken<DesktopShellContext>;
//# sourceMappingURL=desktop-shell-context.d.ts.map