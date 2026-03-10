import type {
  LocalDatabaseStatus,
  LocalRecord,
  LocalSyncOperation
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
