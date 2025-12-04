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
     * GET request
     */
    get: (endpoint: string, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "GET",
        });
    },

    /**
     * POST request with JSON body
     */
    post: (endpoint: string, data?: any, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
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
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
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
        });
    },

    /**
     * POST request with FormData (for file uploads)
     */
    postFormData: (endpoint: string, formData: FormData, options?: RequestInit) => {
        return fetch(getApiUrl(endpoint), {
            ...options,
            method: "POST",
            body: formData,
        });
    },
};

// Export the base URL for direct access if needed
export { API_BASE_URL };
