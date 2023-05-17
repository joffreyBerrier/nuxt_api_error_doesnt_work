export default (clientHttp, apiVersion) => ({
  invitationData(query) {
    return clientHttp.get(`${apiVersion}/auth/invitation?${query}`);
  },
  validateToken() {
    return clientHttp.get(`${apiVersion}/auth/validate_token`);
  },
});
