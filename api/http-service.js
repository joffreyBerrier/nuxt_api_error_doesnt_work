import { formatResponseApi as serializeData } from "./api-serializer";

export class HttpService {
  constructor({
    useFetch,
    baseURL,
    hasHeader = true,
    hasHttpSource = true,
    showSsrLog = false,
    $cookies = () => {},
  }) {
    this.$fetch = useFetch;
    this.baseURL = baseURL;
    this.showSsrLog = showSsrLog;
    this.hasHeader = hasHeader;
    this.hasHttpSource = hasHttpSource;
    this.headers = this.hasHttpSource ? { httpSource: "web" } : {};
    this.$cookies = $cookies;
  }

  setHeader = (headers) => {
    return new Promise((resolve, _) => {
      if (Object.values(headers).every(Boolean)) {
        if (this.hasHttpSource) {
          this.headers = { httpSource: "web", ...headers };
        } else {
          this.headers = {
            ...headers,
          };
        }
      }

      resolve();
    });
  };

  getHeaders = (headers) => {
    const accessToken = headers?.get("access-token") || "";
    const client = headers?.get("client") || "";
    const uid = headers?.get("uid") || "";

    return {
      accessToken,
      client,
      uid,
    };
  };

  setHeadersOnResponse = async (res) => {
    const { accessToken, client, uid } = this.getHeaders(res.headers);

    if (accessToken && client && uid) {
      const uidCookie = this.$cookies("uid");
      const clientCookie = this.$cookies("client");
      const accessTokenCookie = this.$cookies("access-token");

      uidCookie.value = uid;
      clientCookie.value = client;
      accessTokenCookie.value = accessToken;

      await this.setHeader({
        "access-token": accessToken,
        client,
        uid,
      });
    }

    return { accessToken, client, uid };
  };

  formatResponseApi = (input) => {
    // *****
    // INPUT equal to { data, pending, error }
    // *****
    // Example :
    //   "data": {
    //       "__v_isShallow": false,
    //       "__v_isRef": true,
    //       "_rawValue": null,
    //       "_value": null
    //   },
    //   "pending": {
    //       "__v_isShallow": false,
    //       "__v_isRef": true,
    //       "_rawValue": false,
    //       "_value": false
    //   },
    //   "error": {
    //       "_object": {
    //           "#endpoint_which_have_errors": {
    //               "message": " (status code (#request url)",
    //               "statusCode": status,
    //               "statusMessage": "Bad Request",
    //               "data": {
    //                   # Array of errors
    //                   "errors": [
    //                       {
    //                           "user": {
    //                               "invitation_token": "invalid"
    //                           }
    //                       }
    //                   ]
    //               }
    //           }
    //       },
    //       "_key": "# Endpoint",
    //       "__v_isRef": true
    //   }
    // }

    // Return data if no error
    if (input?.data?.value) return input.data.value;

    // Return a Promise.reject if error
    // Promise allows to have requests that fall in error when using then / catch or try / catch methods in Javascript
    if (input?.error?.value?.data) {
      const responseErrors = {
        response: {
          data: {
            errors: input.error.value.data.errors,
          },
        },
      };

      return Promise.reject(responseErrors);
    }
  };

  triggerOnResponse = async (response) => {
    await this.setHeadersOnResponse(response);
  };

  handleOnRequest = async () => {
    if (
      this.$cookies("access-token").value &&
      this.$cookies("client").value &&
      this.$cookies("uid").value
    ) {
      return await this.setHeader({
        "access-token": this.$cookies("access-token").value,
        client: this.$cookies("client").value,
        uid: this.$cookies("uid").value,
      });
    }
  };

  post = (url, data) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "POST",
      options: {
        body: { ...data },
        headers: { ...this.headers },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headersing to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  get = (url, data) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "GET",
      options: {
        params: data ? { ...data.params } : {},
        headers: { ...this.headers },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  put = (url, data) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "PUT",
      options: {
        body: { ...data },
        headers: { ...this.headers },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  delete = (url) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "DELETE",
      options: {
        headers: { ...this.headers },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  putFormData = (url, formData) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "PUT",
      options: {
        body: formData,
        headers: {
          ...this.headers,
          "Content-Disposition": formData,
        },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  upload = (url, headers = {}) => {
    return this.$fetch({
      baseURL: this.baseURL,
      url,
      method: "GET",
      options: {
        responseType: "blob",
        headers: this.hasHeader
          ? { ...this.headers, ...headers }
          : { ...headers },
        transform: (input) => {
          // Serialize data
          return serializeData(input);
        },
        onRequest: () => {
          // Trigger on each request, using to get headers
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          // You can't return a new response in the onResponse hook
          return this.triggerOnResponse(response);
        },
      },
    })
      .then((response) => {
        // Return a promise and manager resolve / reject to have a consistent API with try {} catch(err) {} methods
        return this.formatResponseApi(response);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };
}
