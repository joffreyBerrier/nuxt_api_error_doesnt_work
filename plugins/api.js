import { setNewClientApi } from '~/api/index';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseURL = 'https://staging-michelangelo.herokuapp.com/fr/api';

  const { clientApi, setHeader } = setNewClientApi({
    baseURL,
    config,
    locale: 'fr',
    useCookie,
    useFetch: useCustomFetch,
  });

  return {
    provide: {
      api: { ...clientApi, setHeader },
    },
  };
});
