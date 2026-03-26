import { EventEmitter } from "@angular/core";
import { type CfmTone } from "@conformeo/ui";
import * as i0 from "@angular/core";
type RegulatoryShowcaseActionKind = "scroll" | "site_enrichment";
type RegulatoryShowcaseActionable = {
    actionKind: RegulatoryShowcaseActionKind;
    actionLabel: string;
    sectionId: string;
    obligationId: string | null;
    siteId: string | null;
};
type RegulatoryShowcaseSummaryInput = {
    statusLabel: string;
    tone: CfmTone;
    headline: string;
    summary: string;
    context: string | null;
    scoreSummary: string;
    profileLabel: string;
    profileTone: CfmTone;
    siteLabel: string | null;
    siteTone: CfmTone;
};
type RegulatoryScoreDriverItemInput = {
    id: string;
    label: string;
    detail: string;
    statusLabel: string;
    tone: CfmTone;
};
type RegulatoryShowcasePriorityItemInput = RegulatoryShowcaseActionable & {
    id: string;
    title: string;
    familyLabel: string;
    levelLabel: string;
    tone: CfmTone;
    impact: string;
    context: string | null;
    focusLabel: string | null;
    rank: number;
};
type RegulatoryShowcaseFamilyCardInput = RegulatoryShowcaseActionable & {
    id: string;
    label: string;
    countLabel: string;
    detail: string;
    statusLabel: string;
    tone: CfmTone;
    highlights: Array<{
        label: string;
        value: string;
    }>;
};
type RegulatoryShowcaseActionItemInput = RegulatoryShowcaseActionable & {
    id: string;
    title: string;
    detail: string;
    supportLabel: string | null;
    tone: CfmTone;
};
type RegulatoryShowcaseEvidenceItemInput = {
    id: string;
    title: string;
    detail: string;
    statusLabel: string;
    tone: CfmTone;
    contextLabel: string | null;
};
export declare class DesktopRegulationShowcaseComponent {
    summary: RegulatoryShowcaseSummaryInput;
    topPriority: RegulatoryShowcasePriorityItemInput | null;
    priorityItems: RegulatoryShowcasePriorityItemInput[];
    familyCards: RegulatoryShowcaseFamilyCardInput[];
    recommendedActions: RegulatoryShowcaseActionItemInput[];
    recommendedActionsSummary: string;
    evidenceItems: RegulatoryShowcaseEvidenceItemInput[];
    proofSupportSummary: string;
    score: number;
    scoreDrivers: RegulatoryScoreDriverItemInput[];
    obligationCountLabel: string;
    evidenceAvailableCount: number;
    evidenceCoverageCount: number;
    overduePriorityCount: number;
    obligationsToVerifyCount: number;
    hasObligations: boolean;
    canReadOrganization: boolean;
    exportLoading: boolean;
    actionBusy: (action: RegulatoryShowcaseActionable) => boolean;
    actionLabel: (action: RegulatoryShowcaseActionable) => string;
    actionTriggered: EventEmitter<RegulatoryShowcaseActionable>;
    exportTriggered: EventEmitter<void>;
    getActionLabel(action: RegulatoryShowcaseActionable): string;
    isActionBusy(action: RegulatoryShowcaseActionable): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<DesktopRegulationShowcaseComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DesktopRegulationShowcaseComponent, "cfm-desktop-regulation-showcase", never, { "summary": { "alias": "summary"; "required": true; }; "topPriority": { "alias": "topPriority"; "required": false; }; "priorityItems": { "alias": "priorityItems"; "required": false; }; "familyCards": { "alias": "familyCards"; "required": false; }; "recommendedActions": { "alias": "recommendedActions"; "required": false; }; "recommendedActionsSummary": { "alias": "recommendedActionsSummary"; "required": false; }; "evidenceItems": { "alias": "evidenceItems"; "required": false; }; "proofSupportSummary": { "alias": "proofSupportSummary"; "required": false; }; "score": { "alias": "score"; "required": false; }; "scoreDrivers": { "alias": "scoreDrivers"; "required": false; }; "obligationCountLabel": { "alias": "obligationCountLabel"; "required": false; }; "evidenceAvailableCount": { "alias": "evidenceAvailableCount"; "required": false; }; "evidenceCoverageCount": { "alias": "evidenceCoverageCount"; "required": false; }; "overduePriorityCount": { "alias": "overduePriorityCount"; "required": false; }; "obligationsToVerifyCount": { "alias": "obligationsToVerifyCount"; "required": false; }; "hasObligations": { "alias": "hasObligations"; "required": false; }; "canReadOrganization": { "alias": "canReadOrganization"; "required": false; }; "exportLoading": { "alias": "exportLoading"; "required": false; }; "actionBusy": { "alias": "actionBusy"; "required": false; }; "actionLabel": { "alias": "actionLabel"; "required": false; }; }, { "actionTriggered": "actionTriggered"; "exportTriggered": "exportTriggered"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=desktop-regulation-showcase.component.d.ts.map