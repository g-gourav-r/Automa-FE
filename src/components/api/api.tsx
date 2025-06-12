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
}

const createApiCall = (url: string, method: HttpMethod) => {
  return async (params: ApiCallParams = {}): Promise<any> => {
    let apiEndpoint = `http://127.0.0.1:8000/${url}`;
    const { body, urlParams, pathVariables, headers = {} } = params;

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

      const data = await response.json();

      if (response.status === 401) {
        toast.error("Session expired. Please sign in again.");
        setTimeout(() => {
          window.location.href = "/session-expired";
        }, 1500);
        return Promise.reject(data);
      }

      if (!response.ok) {
        return Promise.reject(data);
      }

      return Promise.resolve(data);
    } catch (error) {
      toast.error("Network error, please try again.");
      return Promise.reject(error);
    }
  };
};

export default createApiCall;
