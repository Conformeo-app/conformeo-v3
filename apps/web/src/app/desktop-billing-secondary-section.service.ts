import { Injectable, computed, signal } from "@angular/core";

type DesktopBillingSecondarySectionState = {
  key: string | null;
  label: string;
  open: boolean;
};

const DEFAULT_STATE: DesktopBillingSecondarySectionState = {
  key: null,
  label: "Repères métier",
  open: false,
};

@Injectable()
export class DesktopBillingSecondarySectionService {
  private readonly state = signal<DesktopBillingSecondarySectionState>(DEFAULT_STATE);

  readonly hasCurrent = computed(() => this.state().key !== null);
  readonly currentLabel = computed(() => this.state().label);
  readonly isCurrentOpen = computed(() => this.state().open);

  activate(key: string, label = "Repères métier") {
    this.state.set({
      key,
      label,
      open: false,
    });
  }

  clear(key: string) {
    if (this.state().key === key) {
      this.state.set(DEFAULT_STATE);
    }
  }

  toggleCurrent() {
    const current = this.state();
    if (!current.key) {
      return;
    }

    this.state.set({
      ...current,
      open: !current.open,
    });
  }

  isOpenFor(key: string): boolean {
    const current = this.state();
    return current.key === key && current.open;
  }
}
