import axios from "axios";
import { Message } from "element-ui";
import Cookies from "js-cookie";

const baseURL = "/";
const CODE = {
  ERROR_CODE: -1,
  SUCCESS_CODE: 200,
};
class HttpRequest {
  constructor() {
    this.instance = axios.create({ baseURL, withCredentials: true });
    httpInterceptor(this.instance);
  }

  get(requestUrl, requestParams, requestOptions = {}) {
    return this.Request(requestUrl, "get", requestParams, requestOptions);
  }

  post(requestUrl, requestParams, requestOptions = {}) {
    return this.Request(requestUrl, "post", requestParams, requestOptions);
  }

  upload(requestUrl, requestParams, requestOptions = {}) {
    const requestHeaders = { "Content-Type": "multipart/form-data" };

    return this.Request(requestUrl, "post", requestParams, {
      requestHeaders,
      ...requestOptions,
    });
  }

  Request(requestUrl, method = "post", requestParams = {}, requestOptions) {
    if (!requestUrl) {
      throw new Error("请填写URl!");
    }
    const { requestHeaders = {}, responseType = "" } = requestOptions;
    let data = null,
      params = {};

    if (method === "get") params = requestParams;
    else if (method === "post") data = requestParams;

    // 请求参数
    const requestObject = {
      url: `${requestUrl}`,
      method,
      data,
      params,
      headers: getHeaders(requestHeaders),
    };
    if (responseType) requestObject.responseType = responseType;
    return new Promise((resolve, reject) => {
      this.beforeRequest(requestOptions);
      this.instance
        .request(requestObject)
        .then((response) => {
          const result = this.transformResponse(response, requestOptions);
          if (result.status === 500) {
            Message.error(result.message || result.msg || "请求出错");
            reject(result);
          } else {
            if (result.status === 200 || result.code === 0) {
              resolve(result);
            } else {
              Message.error(result.message || result.msg || "请求出错");
              reject(result);
            }
          }
        })
        .catch((error) => {
          Message.error(error.message || error.msg || "请求出错");
          reject(error);
        })
        .finally((response) => {
          this.beforeResponse(response, requestOptions);
        });
    });
  }

  // 接口请求前的钩子
  beforeRequest(requestOptions) {
    const data = Cookies.get();

    if (window.location.pathname !== "/mp_jf_self/login" && !data.code) {
      window.location.href = `${window.location.origin}/mp_jf_self/login`;
      return;
    }
    this.transformLoadingStatus(requestOptions, true);
  }

  // 接口响应前的钩子
  beforeResponse(response, requestOptions) {
    this.transformLoadingStatus(requestOptions, false);
  }

  // 处理请求loading
  transformLoadingStatus(requestOptions, status) {
    const { vm = null, loading = null } = requestOptions;

    // vm为vue组件实例
    if (loading && vm) {
      // transform loading
      if (Array.isArray(loading)) {
        loading.forEach((item) => {
          vm[item] = status;
        });
      } else vm[loading] = status;
    }
  }

  // 响应数据处理
  transformResponse(response) {
    let result = response.data;
    // 处理文件流响应
    if (Object.prototype.toString.call(result) === "[object ArrayBuffer]") {
      result = {
        data: result,
      };
      if (response["headers"]["content-disposition"]) {
        let filename = /"(.*)"/.exec(
          response["headers"]["content-disposition"].split("filename=")[1],
        );
        if (filename) {
          filename = filename[1];
          result["octet-stream-filename"] = decodeURIComponent(filename);
        }
      }
    }

    return response;
  }
}

// 请求头添加鉴权数据等额外的配置
export function getHeaders(requestHeaders) {
  const header = { ...requestHeaders };
  return {
    ...header,
  };
}

// 全局拦截器
function httpInterceptor(instance) {
  instance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (res) => {
      // 添加需要从响应拿到的数据
      if (res.headers.verificationcode)
        res.data.verificationcode = res.headers.verificationcode;
      if (res.status === CODE.SUCCESS_CODE) {
        return Promise.resolve(res.data);
      }
      if (res.status !== CODE.SUCCESS_CODE) {
        Message.error("请求出错");
      }
    },
    (error) => {
      return Promise.reject(error.response && error.response.data);
    },
  );
}

export default new HttpRequest();
