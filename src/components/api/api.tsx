export const GET = 'get';
export const POST = 'post';
export const PUT = 'put';
export const DELETE = 'delete';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface ApiCallParams {
  body?: FormData | Record<string, any>;
  urlParams?: Record<string, string>;
  pathVariables?: Record<string, string | number>;
  headers?: Record<string, string>;
}

const createApiCall = (url: string, method: HttpMethod) => {
  return (params: ApiCallParams = {}): Promise<any> => {
    let apiEndpoint = `https://invoice-parser-image-669034154292.asia-south1.run.app/${url}`;
    const { body, urlParams, pathVariables, headers = {} } = params;

    // Handle URL parameters
    if (urlParams) {
      apiEndpoint = `${apiEndpoint}?${new URLSearchParams(urlParams)}`;
    }

    // Handle path variables
    if (pathVariables) {
      apiEndpoint = Object.keys(pathVariables).reduce(
        (acc, curr) => acc.replace(`{${curr}}`, String(pathVariables[curr])),
        apiEndpoint
      );
    }

    const isFormData = body instanceof FormData;
    const requestHeaders = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    };

    return fetch(apiEndpoint, {
      method,
      headers: requestHeaders,
      body: method !== GET ? (isFormData ? body : JSON.stringify(body)) : undefined,
    })
      .then(async (res) => {
        const resp = await res.json();
        if (res.ok) return Promise.resolve(resp);
        return Promise.reject(resp);
      });
  };
};

export default createApiCall;
