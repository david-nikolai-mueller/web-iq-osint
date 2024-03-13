import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';


export class IrisHttpClient {

    private username: string;
    private password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    /**
     * Transforms the given request to a format that is supported by Axios. This takes the body,
     * method and headers of the given request. Then executes it and transforms the response
     * back to the desired format.
     */
    fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
        const config: AxiosRequestConfig = {
            url: url.toString(),
            method: <Method> init?.method,
            headers: <Record<string, string>> init?.headers,
            data: init?.body,
            withCredentials: true,
            auth: {
                username: this.username,
                password: this.password
            }
        };

        return Promise.resolve(axios.request(config).then((res: AxiosResponse) => {
            return this.transformResponse(res);
        }));
    }

    /**
     * Transforms the axiosResponse to the format that is required by our NSwag client {@link IrisApiClient}.
     * Uses the headers, status and body.
     *
     * @param axiosResponse Response to transform.
     * @returns Transformed response that is ready to be used by the {@link IrisApiClient}.
     */
    transformResponse(axiosResponse: AxiosResponse): Response {
        return <Response> {
            headers: <HeadersInit> axiosResponse.headers,
            status: axiosResponse.status,
            text: () => {
                return Promise.resolve(JSON.stringify(axiosResponse.data));
            }
        };
    }
}

export function generateUniqueID(): string {
    const uuid = (): string => {
      let dt = new Date().getTime();
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
      return uuid;
    };
    return uuid() //.replace(/-/g, '');
}