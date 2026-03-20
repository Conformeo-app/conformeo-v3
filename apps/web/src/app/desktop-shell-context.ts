import { InjectionToken, TemplateRef } from "@angular/core";
import type { AuthSession, MembershipAccess, ModuleCode } from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";

export type DesktopNavigationItem = {
  route: string;
  label: string;
  tone: CfmTone;
};

export type WorkspaceTemplateName =
  | "home"
  | "reglementation"
  | "chantier"
  | "facturation"
  | "coordination";

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
  getWorkspaceTemplate(name: WorkspaceTemplateName): TemplateRef<unknown> | null;
  getModuleNavigationLabel(moduleCode: ModuleCode): string;
  changeOrganization(): Promise<void>;
  logout(): void;
}

export const DESKTOP_SHELL_CONTEXT = new InjectionToken<DesktopShellContext>("DESKTOP_SHELL_CONTEXT");
