import { HttpService } from './http-service';

import * as v1 from './apiV1';

export const setNewClientApi = ({
  baseURL,
  showSsrLog = false,
  useCookie,
  useFetch,
}) => {
  const clientApiV1 = v1.default;
  const services = {
    ...clientApiV1,
  };
  const clientApi = {};
  const h = new HttpService({
    $cookies: useCookie,
    baseURL,
    showSsrLog,
    useFetch,
  });

  Object.keys(services).forEach((version) => {
    Object.keys(services[version]).forEach((service) => {
      if (!clientApi[version]) clientApi[version] = {};
      clientApi[version][service] = services[version][service](h, version);
    });
  });

  return { clientApi, setHeader: h.setHeader };
};
