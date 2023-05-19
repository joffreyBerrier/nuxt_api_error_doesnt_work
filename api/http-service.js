import { formatResponseApi } from "./api-serializer";

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

  triggerOnResponse = async (response, url) => {
    await this.setHeadersOnResponse(response);
    return response
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then(({ data, error }) => {
        if (data.value) return data.value;
        if (error.value) return Promise.reject(error.value);
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then((response) => {
        response.errors = computed(() => response.error.value?.data?.errors || [])
        response.errorMessage = computed(() => {
          const data = response.error.value?.data?.errors[0]
          const key = Object.keys(data)[0]
          const value = unref(data[key])
          // format it into a string code, easier to process
          // probably want some state, i18n and form integration
          switch(`${key}.${Object.keys(value)[0]}`) {
            case 'user.invitation_token':
              return 'Invalid invitation token'
          }
          // void
        })
        response.success = computed(() => !response.error.value)
        return response
      })
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then(({ data, error }) => {
        if (data.value) return data.value;
        if (error.value) return Promise.reject(error.value);
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then(({ data, error }) => {
        if (data.value) return data.value;
        if (error.value) return Promise.reject(error.value);
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then(({ data, error }) => {
        if (data.value) return data.value;
        if (error.value) return Promise.reject(error.value);
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
          return formatResponseApi(input);
        },
        onRequest: () => {
          return this.handleOnRequest();
        },
        onResponse: ({ response }) => {
          return this.triggerOnResponse(response, url);
        },
      },
    })
      .then(({ data, error }) => {
        if (data.value) return data.value;
        if (error.value) return Promise.reject(error.value);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };
}
