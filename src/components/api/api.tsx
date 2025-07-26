import { toast } from "sonner";

export const GET = "get";
export const POST = "post";
export const PUT = "put";
export const DELETE = "delete";

export type HttpMethod = typeof GET | typeof POST | typeof PUT | typeof DELETE;

interface ApiCallParams {
  body?: FormData | Record<string, any>;
  urlParams?: Record<string, string>;
  pathVariables?: Record<string, string | number>;
  headers?: Record<string, string>;
  isAuthEndpoint?: boolean; // NEW: Add a flag to indicate if this is an authentication endpoint
}

const createApiCall = (url: string, method: HttpMethod) => {
  return async (params: ApiCallParams = {}): Promise<any> => {
    let apiEndpoint = `http://localhost:8000/${url}`;
    // Destructure isAuthEndpoint from params
    const { body, urlParams, pathVariables, headers = {}, isAuthEndpoint = false } = params; // NEW: Default to false

    // Append URL params
    if (urlParams) {
      const searchParams = new URLSearchParams(urlParams);
      apiEndpoint += `?${searchParams.toString()}`;
    }

    // Replace path variables
    if (pathVariables) {
      apiEndpoint = Object.entries(pathVariables).reduce(
        (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
        apiEndpoint
      );
    }

    const isFormData = body instanceof FormData;
    const requestHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      // Add Authorization header if a token exists and it's not an auth endpoint
      ...(localStorage.getItem("appData") && !isAuthEndpoint
        ? { "Authorization": `Bearer ${JSON.parse(localStorage.getItem("appData") || "{}").token}` }
        : {}),
      ...headers,
    };

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: requestHeaders,
        body:
          method !== GET
            ? isFormData
              ? body
              : JSON.stringify(body)
            : undefined,
      });

      // NEW LOGIC: Handle 401 based on isAuthEndpoint flag
      if (response.status === 401) {
        if (!isAuthEndpoint) {
          // This is a 401 on a protected route, so session expired.
          toast.error("Session expired. Please sign in again.");
          setTimeout(() => {
            window.location.href = "/session-expired"; // Or navigate to /auth/login
          }, 1500);
        }
        // If it's an auth endpoint (like /login), we don't redirect on 401.
        // We let the specific component handle it (e.g., display "Invalid credentials").
        const errorData = await response.json();
        return Promise.reject(errorData); // Always reject so component can catch and show specific error
      }

      const data = await response.json(); // Parse JSON for other statuses too

      if (!response.ok) {
        // For other non-OK statuses (e.g., 400, 403, 404, 500), just reject with the error data
        return Promise.reject(data);
      }

      return Promise.resolve(data); // Resolve with data on success
    } catch (error) {
      // This catches network errors (e.g., server unreachable)
      toast.error("Network error, please try again.");
      return Promise.reject(error);
    }
  };
};

export default createApiCall;