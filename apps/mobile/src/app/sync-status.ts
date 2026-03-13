import type {
  WorksiteEssentialDetail,
  WorksiteLocalSyncStatus,
  WorksiteSafetyChecklist
} from "@conformeo/contracts";
import type {
  LocalDatabaseStatus,
  LocalRecord,
  LocalSyncOperation,
  PreparedWorksiteSyncBatch,
  PreparedWorksiteSyncItem
} from "./local-database.types";

export type SyncWording =
  | "enregistré sur l’appareil"
  | "en attente de synchronisation"
  | "synchronisé"
  | "à vérifier";

export interface SyncStatusCopy {
  label: SyncWording;
  tone: "calm" | "progress" | "success" | "warning";
  detail: string;
}

function hasFailedOperations(operations: LocalSyncOperation[]): boolean {
  return operations.some((operation) => operation.status === "failed");
}

function hasPendingOperations(operations: LocalSyncOperation[]): boolean {
  return operations.some(
    (operation) =>
      operation.status === "pending" || operation.status === "in_progress"
  );
}

function hasMeaningfulSafetyChecklist(
  checklist: WorksiteSafetyChecklist | null | undefined
): checklist is WorksiteSafetyChecklist {
  if (!checklist) {
    return false;
  }

  if (checklist.status === "validated" || checklist.sync_status !== "local_only") {
    return true;
  }

  if ((checklist.comment_text ?? "").trim().length > 0) {
    return true;
  }

  return checklist.items.some((item) => item.answer !== null);
}

export function getGlobalSyncStatusCopy(
  status: LocalDatabaseStatus | null,
  isOnline: boolean
): SyncStatusCopy {
  if (!status) {
    return {
      label: "enregistré sur l’appareil",
      tone: "calm",
      detail: isOnline
        ? "L’application prépare le stockage local."
        : "Pas de réseau pour le moment. L’application reste utilisable."
    };
  }

  if (status.failedSyncOperationCount > 0) {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: isOnline
        ? "Certaines mises à jour ont besoin d’une vérification avant de repartir."
        : "Certaines mises à jour sont à vérifier, mais tout reste enregistré sur l’appareil."
    };
  }

  if (status.pendingSyncOperationCount > 0 || status.retryableSyncOperationCount > 0) {
    return {
      label: "en attente de synchronisation",
      tone: "progress",
      detail: isOnline
        ? "Des mises à jour locales sont prêtes pour un prochain passage de synchronisation."
        : "Pas de réseau : vous pouvez continuer, les changements restent bien enregistrés sur l’appareil."
    };
  }

  if (status.syncOperationCount > 0) {
    return {
      label: "synchronisé",
      tone: "success",
      detail: "Les dernières opérations connues sont traitées côté appareil."
    };
  }

  return {
    label: "enregistré sur l’appareil",
    tone: "calm",
    detail: isOnline
      ? "Vos données locales sont bien conservées sur cet appareil."
      : "Pas de réseau : vos données restent disponibles et enregistrées sur l’appareil."
  };
}

export function getRecordSyncStatusCopy(
  record: LocalRecord,
  operations: LocalSyncOperation[]
): SyncStatusCopy {
  const relatedOperations = operations.filter(
    (operation) =>
      operation.entityName === record.entityName && operation.entityId === record.recordId
  );

  if (relatedOperations.some((operation) => operation.status === "failed")) {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: "Cette donnée locale a rencontré un souci et doit être vérifiée."
    };
  }

  if (
    relatedOperations.some(
      (operation) =>
        operation.status === "pending" || operation.status === "in_progress"
    ) ||
    record.syncStatus === "pending_sync"
  ) {
    return {
      label: "en attente de synchronisation",
      tone: "progress",
      detail: "Cette donnée est bien enregistrée sur l’appareil en attendant le prochain envoi."
    };
  }

  if (record.syncStatus === "synced") {
    return {
      label: "synchronisé",
      tone: "success",
      detail: "Cette donnée locale ne demande plus d’action immédiate."
    };
  }

  return {
    label: "enregistré sur l’appareil",
    tone: "calm",
    detail: "Cette donnée reste disponible localement, même sans réseau."
  };
}

export function getOperationSyncStatusCopy(
  operation: LocalSyncOperation
): SyncStatusCopy {
  if (operation.status === "failed") {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: "La dernière tentative n’a pas abouti."
    };
  }

  if (operation.status === "completed") {
    return {
      label: "synchronisé",
      tone: "success",
      detail: "L’opération locale est marquée comme traitée."
    };
  }

  return {
    label: "en attente de synchronisation",
    tone: "progress",
    detail: "L’opération reste dans la file locale."
  };
}

export function getTerrainObjectSyncStatusCopy(
  syncStatus: WorksiteLocalSyncStatus,
  operations: LocalSyncOperation[]
): SyncStatusCopy {
  if (hasFailedOperations(operations)) {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: "Cet élément terrain reste bien enregistré sur l’appareil, mais il est à vérifier avant le prochain envoi."
    };
  }

  if (hasPendingOperations(operations) || syncStatus === "pending_sync") {
    return {
      label: "en attente de synchronisation",
      tone: "progress",
      detail: "Cet élément terrain est bien enregistré sur l’appareil en attendant le prochain envoi."
    };
  }

  if (syncStatus === "synced") {
    return {
      label: "synchronisé",
      tone: "success",
      detail: "Cet élément terrain ne demande plus d’action locale immédiate."
    };
  }

  return {
    label: "enregistré sur l’appareil",
    tone: "calm",
    detail: "Cet élément terrain reste disponible sur l’appareil, même sans réseau."
  };
}

export function getPreparedWorksiteSyncItemStatusCopy(
  item: PreparedWorksiteSyncItem
): SyncStatusCopy {
  if (item.status === "failed") {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: "Ce lot terrain est à vérifier avant le prochain envoi."
    };
  }

  return {
    label: "en attente de synchronisation",
    tone: "progress",
    detail:
      item.status === "in_progress"
        ? "Ce lot terrain est déjà en préparation locale."
        : "Ce lot terrain est prêt sur l’appareil pour un futur envoi."
  };
}

export function getPreparedWorksiteSyncBatchStatusCopy(
  batch: PreparedWorksiteSyncBatch | null
): SyncStatusCopy {
  if (!batch || batch.preparedItemCount === 0) {
    return {
      label: "enregistré sur l’appareil",
      tone: "calm",
      detail: "Aucun lot terrain n’attend de départ pour le moment."
    };
  }

  if (batch.items.some((item) => item.status === "failed")) {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: "Un ou plusieurs lots terrain sont à vérifier avant le prochain envoi."
    };
  }

  return {
    label: "en attente de synchronisation",
    tone: "progress",
    detail: "Des lots terrain sont déjà prêts sur l’appareil pour un futur envoi."
  };
}

export function getWorksiteSyncStatusCopy(
  worksite: WorksiteEssentialDetail,
  operations: LocalSyncOperation[],
  preparedBatch: PreparedWorksiteSyncBatch | null,
  isOnline: boolean
): SyncStatusCopy {
  const relevantEntityKeys = new Set<string>([
    ...worksite.recent_equipment_movements.map(
      (movement) => `worksite_equipment_movement:${movement.id}`
    ),
    ...worksite.recent_proofs.map((proof) => `worksite_proof:${proof.id}`),
    ...worksite.recent_voice_notes.map(
      (voiceNote) => `worksite_voice_note:${voiceNote.id}`
    ),
    ...worksite.recent_signatures.map(
      (signature) => `worksite_signature:${signature.id}`
    ),
    ...worksite.risk_reports.map((report) => `worksite_risk_report:${report.id}`)
  ]);

  if (hasMeaningfulSafetyChecklist(worksite.safety_checklist)) {
    relevantEntityKeys.add(`worksite_safety_checklist:${worksite.safety_checklist.id}`);
  }

  const relevantOperations = operations.filter((operation) =>
    relevantEntityKeys.has(`${operation.entityName}:${operation.entityId}`)
  );
  const relevantPreparedItems = preparedBatch?.items.filter((item) =>
    relevantEntityKeys.has(`${item.entityName}:${item.entityId}`)
  ) ?? [];

  if (
    hasFailedOperations(relevantOperations) ||
    relevantPreparedItems.some((item) => item.status === "failed")
  ) {
    return {
      label: "à vérifier",
      tone: "warning",
      detail: isOnline
        ? "Certains éléments de ce chantier sont à vérifier avant le prochain envoi."
        : "Pas de réseau : tout reste enregistré sur l’appareil, mais certains éléments de ce chantier sont à vérifier."
    };
  }

  const hasPendingTerrainSync =
    hasPendingOperations(relevantOperations) ||
    relevantPreparedItems.length > 0 ||
    worksite.recent_proofs.some((proof) => proof.sync_status === "pending_sync") ||
    worksite.recent_voice_notes.some((voiceNote) => voiceNote.sync_status === "pending_sync") ||
    worksite.recent_signatures.some((signature) => signature.sync_status === "pending_sync") ||
    worksite.risk_reports.some((report) => report.sync_status === "pending_sync") ||
    (hasMeaningfulSafetyChecklist(worksite.safety_checklist) &&
      worksite.safety_checklist.sync_status === "pending_sync");

  if (hasPendingTerrainSync) {
    return {
      label: "en attente de synchronisation",
      tone: "progress",
      detail: isOnline
        ? "Des éléments de ce chantier sont prêts à partir lors du prochain envoi."
        : "Pas de réseau : les éléments de ce chantier restent bien enregistrés sur l’appareil en attendant le prochain envoi."
    };
  }

  const hasTerrainContent =
    worksite.recent_equipment_movements.length > 0 ||
    worksite.recent_proofs.length > 0 ||
    worksite.recent_voice_notes.length > 0 ||
    worksite.recent_signatures.length > 0 ||
    worksite.risk_reports.length > 0 ||
    hasMeaningfulSafetyChecklist(worksite.safety_checklist);

  const isFullySynced =
    hasTerrainContent &&
    worksite.recent_equipment_movements.every((movement) => movement.sync_status === "synced") &&
    worksite.recent_proofs.every((proof) => proof.sync_status === "synced") &&
    worksite.recent_voice_notes.every((voiceNote) => voiceNote.sync_status === "synced") &&
    worksite.recent_signatures.every((signature) => signature.sync_status === "synced") &&
    worksite.risk_reports.every((report) => report.sync_status === "synced") &&
    (!hasMeaningfulSafetyChecklist(worksite.safety_checklist) ||
      worksite.safety_checklist.sync_status === "synced");

  if (isFullySynced) {
    return {
      label: "synchronisé",
      tone: "success",
      detail: "Les éléments terrain visibles pour ce chantier ne demandent plus d’action locale immédiate."
    };
  }

  return {
    label: "enregistré sur l’appareil",
    tone: "calm",
    detail: hasTerrainContent
      ? "Les éléments déjà capturés pour ce chantier restent bien enregistrés sur l’appareil."
      : "Ce chantier reste consultable sur l’appareil et prêt à recevoir des captures terrain."
  };
}
