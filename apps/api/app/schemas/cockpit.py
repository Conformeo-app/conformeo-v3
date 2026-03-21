from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class CockpitKpiRead(BaseModel):
    id: str
    label: str
    value: str
    detail: str
    status_label: str
    tone: Literal["neutral", "calm", "progress", "success", "warning"]


class CockpitAlertRead(BaseModel):
    id: str
    title: str
    description: str
    module_label: str
    tone: Literal["neutral", "calm", "progress", "success", "warning"]
    priority: int


class CockpitModuleHighlightRead(BaseModel):
    id: str
    label: str
    value: str


class CockpitModuleCardRead(BaseModel):
    id: str
    label: str
    headline: str
    detail: str
    highlights: list[CockpitModuleHighlightRead]
    status_label: str
    tone: Literal["neutral", "calm", "progress", "success", "warning"]


class CockpitSummaryRead(BaseModel):
    kpis: list[CockpitKpiRead]
    alerts: list[CockpitAlertRead]
    module_cards: list[CockpitModuleCardRead]
