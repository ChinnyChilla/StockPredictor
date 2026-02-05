export const API_BASE_URL = process.env.NEXT_PUBLIC_HOST_URL || '';

// A helper to format URLs consistently
export const getApiUrl = (endpoint: string) => {
	// Ensure the endpoint starts with a slash
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	return `${API_BASE_URL}${cleanEndpoint}`;
};