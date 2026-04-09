import { Injectable } from "@angular/core";
import type { AuthSession } from "@conformeo/contracts";
import { BehaviorSubject } from "rxjs";

import { getStoredAccessToken, getStoredOrganizationId } from "./auth-client";

type DesktopSessionSnapshot = {
  accessToken: string | null;
  organizationId: string | null;
  session: AuthSession | null;
};

@Injectable({ providedIn: "root" })
export class DesktopSessionStateService {
  private readonly snapshotSubject = new BehaviorSubject<DesktopSessionSnapshot>({
    accessToken: getStoredAccessToken(),
    organizationId: getStoredOrganizationId(),
    session: null,
  });

  readonly snapshot$ = this.snapshotSubject.asObservable();

  get snapshot(): DesktopSessionSnapshot {
    return this.snapshotSubject.value;
  }

  get accessToken(): string | null {
    return this.snapshot.accessToken;
  }

  get organizationId(): string | null {
    return this.snapshot.organizationId;
  }

  get session(): AuthSession | null {
    return this.snapshot.session;
  }

  sync(snapshot: Partial<DesktopSessionSnapshot>): void {
    const nextSnapshot: DesktopSessionSnapshot = {
      ...this.snapshot,
      ...snapshot,
    };
    const previousSnapshot = this.snapshotSubject.value;

    if (
      previousSnapshot.accessToken === nextSnapshot.accessToken
      && previousSnapshot.organizationId === nextSnapshot.organizationId
      && previousSnapshot.session === nextSnapshot.session
    ) {
      return;
    }

    this.snapshotSubject.next(nextSnapshot);
  }

  clear(): void {
    this.snapshotSubject.next({
      accessToken: null,
      organizationId: null,
      session: null,
    });
  }
}
