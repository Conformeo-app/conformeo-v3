import { Injectable, inject } from "@angular/core";
import type {
  BillingCustomerRecord,
  MembershipAccess,
  QuoteRecord,
  WorksiteApiSummary,
  InvoiceRecord,
} from "@conformeo/contracts";
import { BehaviorSubject } from "rxjs";

import type { DesktopBillingModuleState } from "./desktop-billing-page-context";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import {
  listBillingCustomers,
  listInvoices,
  listQuotes,
  listWorksites,
} from "./organization-client";

const INITIAL_STATE: DesktopBillingModuleState = {
  customers: [],
  quotes: [],
  invoices: [],
  worksites: [],
};

@Injectable({ providedIn: "root" })
export class DesktopBillingStateService {
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly stateSubject = new BehaviorSubject<DesktopBillingModuleState>(INITIAL_STATE);
  private hydratedScopeKey: string | null = null;
  private refreshPromise: Promise<DesktopBillingModuleState> | null = null;
  private refreshScopeKey: string | null = null;

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.sessionState.snapshot$.subscribe(() => {
      const scopeKey = this.getScopeKey();
      if (!scopeKey) {
        this.clear();
        return;
      }

      if (this.hydratedScopeKey && this.hydratedScopeKey !== scopeKey) {
        this.clear();
      }
    });
  }

  get customers(): BillingCustomerRecord[] {
    return this.stateSubject.value.customers;
  }

  get quotes(): QuoteRecord[] {
    return this.stateSubject.value.quotes;
  }

  get invoices(): InvoiceRecord[] {
    return this.stateSubject.value.invoices;
  }

  get worksites(): WorksiteApiSummary[] {
    return this.stateSubject.value.worksites;
  }

  get value(): DesktopBillingModuleState {
    return this.stateSubject.value;
  }

  isHydratedForCurrentSession(): boolean {
    const scopeKey = this.getScopeKey();
    return Boolean(scopeKey && this.hydratedScopeKey === scopeKey);
  }

  replaceState(state: DesktopBillingModuleState): void {
    this.stateSubject.next(state);
    this.hydratedScopeKey = this.getScopeKey();
  }

  setCustomers(customers: BillingCustomerRecord[]): void {
    this.replaceState({
      ...this.stateSubject.value,
      customers,
    });
  }

  setQuotes(quotes: QuoteRecord[]): void {
    this.replaceState({
      ...this.stateSubject.value,
      quotes,
    });
  }

  setInvoices(invoices: InvoiceRecord[]): void {
    this.replaceState({
      ...this.stateSubject.value,
      invoices,
    });
  }

  setWorksites(worksites: WorksiteApiSummary[]): void {
    this.replaceState({
      ...this.stateSubject.value,
      worksites,
    });
  }

  clear(): void {
    this.stateSubject.next(INITIAL_STATE);
    this.hydratedScopeKey = null;
    this.refreshPromise = null;
    this.refreshScopeKey = null;
  }

  async refresh(): Promise<DesktopBillingModuleState> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    const membership = this.sessionState.session?.current_membership ?? null;
    const scopeKey = this.getScopeKey();

    if (!accessToken || !organizationId || !scopeKey || !this.isFacturationReadable(membership)) {
      this.clear();
      return this.stateSubject.value;
    }

    if (this.refreshPromise && this.refreshScopeKey === scopeKey) {
      return this.refreshPromise;
    }

    const nextRefresh = (async () => {
      const [customers, worksites, quotes, invoices] = await Promise.all([
        listBillingCustomers(accessToken, organizationId),
        listWorksites(accessToken, organizationId),
        listQuotes(accessToken, organizationId),
        listInvoices(accessToken, organizationId),
      ]);

      const nextState: DesktopBillingModuleState = {
        customers,
        worksites,
        quotes,
        invoices,
      };
      this.stateSubject.next(nextState);
      this.hydratedScopeKey = scopeKey;
      return nextState;
    })();

    this.refreshScopeKey = scopeKey;
    this.refreshPromise = nextRefresh;

    try {
      return await nextRefresh;
    } finally {
      if (this.refreshPromise === nextRefresh) {
        this.refreshPromise = null;
        this.refreshScopeKey = null;
      }
    }
  }

  private getScopeKey(): string | null {
    const snapshot = this.sessionState.snapshot;
    const userId = snapshot.session?.user?.id ?? null;
    if (!snapshot.accessToken || !snapshot.organizationId || !userId) {
      return null;
    }
    return `${snapshot.accessToken}:${snapshot.organizationId}:${userId}`;
  }

  private isFacturationReadable(membership: MembershipAccess | null): boolean {
    if (!membership) {
      return false;
    }

    const modulesFromEnabledList = membership.enabled_modules ?? [];
    const modulesFromRecords =
      membership.modules
        ?.filter((module) => module.is_enabled)
        .map((module) => module.module_code)
      ?? [];
    const enabledModules = Array.from(new Set([...modulesFromEnabledList, ...modulesFromRecords]));

    return enabledModules.includes("facturation") && membership.permissions.includes("organization:read");
  }
}
