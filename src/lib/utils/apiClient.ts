const DEFAULT_API_URL = 'https://geomapindex.com/api/api-keys/validate';

export interface ValidationResponse {
    valid: boolean;
    message: string;
    usage_count?: number;
}

/**
 * Validate an API key with the server
 * @param apiKey The API key to validate
 * @param componentName The component name requesting validation
 * @param itemsCount Number of tabs or items in the current layout
 * @param apiUrl Optional custom API endpoint
 * @returns Promise resolving to the validation response
 */
export async function validateApiKey(
    apiKey: string | undefined,
    componentName: 'DashDock',
    itemsCount: number,
    apiUrl?: string
): Promise<ValidationResponse> {
    if (!apiKey) {
        return { valid: false, message: "No API key provided" };
    }

    try {
        const url = new URL(apiUrl || DEFAULT_API_URL);
        const fullUrl = `${url.origin}${url.pathname}?key=${apiKey}`;

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                component_name: componentName,
                items_count: itemsCount
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API validation failed:', data);
            return {
                valid: false,
                message: data.message || "API validation failed"
            };
        }

        return {
            valid: data.valid,
            message: data.message,
            usage_count: data.usage_count
        };
    } catch (error) {
        console.error('API key validation error:', error);
        return { valid: false, message: "API validation error" };
    }
}

// Cache for API validation results to minimize API calls
const validationCache = new Map<string, ValidationResponse>();

/**
 * Check if an API key is valid using cached results if available
 * @param apiKey API key to validate
 * @param componentName Component name
 * @param itemsCount Number of items/tabs
 * @param apiUrl Optional custom API URL
 * @returns Promise resolving to validation result
 */
export async function checkApiKeyValidity(
    apiKey: string | undefined,
    componentName: 'DashDock',
    itemsCount: number,
    apiUrl?: string
): Promise<ValidationResponse> {
    // If no API key, return invalid immediately
    if (!apiKey) {
        return { valid: false, message: "No API key provided" };
    }

    // Check cache first to avoid unnecessary API calls
    const cacheKey = `${apiKey}:${componentName}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey)!;
    }

    // If not in cache, validate via API
    const result = await validateApiKey(apiKey, componentName, itemsCount, apiUrl);

    // Cache the result
    validationCache.set(cacheKey, result);

    return result;
}

/**
 * Clear the validation cache for a specific API key
 * @param apiKey The API key to clear from cache
 * @param componentName Optional component name to make cache key more specific
 */
export function clearApiKeyCache(apiKey: string, componentName?: string): void {
    if (componentName) {
        validationCache.delete(`${apiKey}:${componentName}`);
    } else {
        // Clear all cache entries for this API key - using Array.from() to avoid iteration issues
        Array.from(validationCache.keys()).forEach(key => {
            if (key.startsWith(`${apiKey}:`)) {
                validationCache.delete(key);
            }
        });
    }
}