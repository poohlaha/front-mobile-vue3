import { CONSTANT } from "@configs/index";
import { setHeaders } from "@utils/sign";
import Request from "./index";
import { RequestOptions } from "./constant";
import axios from "axios";

axios.defaults.timeout = CONSTANT.REQUEST_TIMEOUT; // 请求超时时间
// axios.defaults.baseURL = process.env.API_ROOT // base_url
// axios.defaults.withCredentials = true; // 选项表明了是否是跨域请求

/**
 * 拦截发送请求
 */
axios.interceptors.request.use(
  (config: any) => {
    // TODO
    config.headers = setHeaders(config) || {}; // 设置请求头
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

/**
 * 拦截响应
 */
axios.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

export function fetch(options: RequestOptions) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    axios(options)
      .then((response: any) => {
        resolve(response);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}

export function getErrorReason(data: { [K: string]: any } = {}) {
  let reason = null;
  let code: number | string = 0;
  try {
    if (!data) return reason;
    let error = data.error;
    if (Request.isString(error)) {
      error = JSON.parse(error) || {};
    }

    reason =
      error.reason || error.message || error.errorMsg || CONSTANT.ERROR_MESSAGE;
    code = error.code || error.errorCode || 500;
  } catch (e) {
    reason = CONSTANT.ERROR_MESSAGE;
    code = 500;
  }

  return {
    reason: reason,
    code: code,
  };
}

export function fetchAll(requests: Array<RequestOptions>) {
  return new Promise((resolve, reject) => {
    axios
      .all(requests)
      .then(
        // @ts-ignore
        axios.spread(() => {
          // @ts-ignore
          if (arguments.length === 0) return;
          let responses: Array<{ [K: string]: any }> = [];
          let errors: Array<{ [K: string]: any }> = [];
          // @ts-ignore
          for (let i = 0; i < arguments.length; i++) {
            // @ts-ignore
            let response: { [K: string]: any } = arguments[i];
            if (!response) continue;

            if (response.status !== 200) {
              errors.push({
                code: 500,
                message: CONSTANT.ERROR_MESSAGE,
              });
              break;
            }

            if (!response.data || response.data.success !== "true") {
              errors.push({
                code: 500,
                message: getErrorReason(response.data || {}),
              });
              break;
            }

            responses.push(response);
          }

          resolve(
            errors.length > 0
              ? {
                  error: true,
                  errors,
                }
              : {
                  error: false,
                  responses,
                },
          );
        }),
      )
      .catch((error: any) => {
        // reject(error)
        resolve({
          error: true,
          errors: [
            {
              code: 500,
              message: CONSTANT.ERROR_MESSAGE,
            },
          ],
        });
      });
  });
}
