export class ApiClientError extends Error {
    status;
    detail;
    constructor(detail, status = null) {
        super(detail);
        this.name = "ApiClientError";
        this.status = status;
        this.detail = detail;
    }
}
export function createHttpApiError(status, detail) {
    return new ApiClientError(detail, status);
}
export function createNetworkApiError(apiBaseUrl) {
    return new ApiClientError(`API Conforméo injoignable sur ${apiBaseUrl}. Vérifiez que le backend est démarré et accessible.`, 0);
}
export function createTimeoutApiError(resourceLabel, timeoutMs) {
    const seconds = Math.max(1, Math.round(timeoutMs / 1000));
    return new ApiClientError(`Le chargement de ${resourceLabel.toLowerCase()} prend plus de temps que prévu (${seconds}s). Le reste de l'espace reste disponible.`, 408);
}
