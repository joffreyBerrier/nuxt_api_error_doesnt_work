export const useCustomFetch = ({ baseURL, url, method, options = {} }) => {
  const defaults = {
    baseURL,
    key: url,
    method,
    ...options,
  };

  return useFetch(url, defaults);
};
