export declare class ApiClientError extends Error {
    readonly status: number | null;
    readonly detail: string;
    constructor(detail: string, status?: number | null);
}
export declare function createHttpApiError(status: number, detail: string): ApiClientError;
export declare function createNetworkApiError(apiBaseUrl: string): ApiClientError;
export declare function createTimeoutApiError(resourceLabel: string, timeoutMs: number): ApiClientError;
//# sourceMappingURL=api-error.d.ts.map