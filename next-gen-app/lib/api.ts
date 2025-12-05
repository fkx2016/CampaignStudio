/**
 * Central API utility for all backend calls
 * Uses environment variable for production, falls back to localhost for development
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Get the full API URL for an endpoint
 * @param endpoint - API endpoint (e.g., "/api/platforms")
 * @returns Full URL
 */
export function getApiUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
}

/**
 * Convenience wrapper for fetch with automatic URL construction
 */
export const api = {
    /**
     * Helper to get headers with Auth
     */
    getHeaders: (options?: RequestInit) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...options?.headers as Record<string, string>,
        };

        // Client-side only
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return headers;
    },

    /**
     * GET request
     */
    get: (endpoint: string, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "GET",
            headers: api.getHeaders(options),
        });
    },

    /**
     * POST request with JSON body
     */
    post: (endpoint: string, data?: any, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "POST",
            headers: api.getHeaders(options),
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    /**
     * PUT request with JSON body
     */
    put: (endpoint: string, data?: any, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "PUT",
            headers: api.getHeaders(options),
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    /**
     * DELETE request
     */
    delete: (endpoint: string, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "DELETE",
            headers: api.getHeaders(options),
        });
    },

    /**
     * POST request with FormData (for file uploads)
     */
    postFormData: (endpoint: string, formData: FormData, options?: RequestInit) => {
        // Special handling for FormData: Don't set Content-Type (browser does it)
        const headers = api.getHeaders(options);
        delete headers["Content-Type"];

        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "POST",
            headers: headers,
            body: formData,
        });
    },
};

// Export the base URL for direct access if needed
export { API_BASE_URL };
