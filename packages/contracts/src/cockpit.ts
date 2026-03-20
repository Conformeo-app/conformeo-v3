export type CockpitTone = "neutral" | "calm" | "progress" | "success" | "warning";

export interface CockpitKpiRecord {
  id: string;
  label: string;
  value: string;
  detail: string;
  status_label: string;
  tone: CockpitTone;
}

export interface CockpitAlertRecord {
  id: string;
  title: string;
  description: string;
  module_label: string;
  tone: CockpitTone;
  priority: number;
}

export interface CockpitModuleHighlightRecord {
  id: string;
  label: string;
  value: string;
}

export interface CockpitModuleCardRecord {
  id: string;
  label: string;
  headline: string;
  detail: string;
  highlights: CockpitModuleHighlightRecord[];
  status_label: string;
  tone: CockpitTone;
}

export interface CockpitSummaryRecord {
  kpis: CockpitKpiRecord[];
  alerts: CockpitAlertRecord[];
  module_cards: CockpitModuleCardRecord[];
}
