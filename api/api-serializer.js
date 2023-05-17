const serializer = (data) => {
  const attributes = data?.attributes
    ? { id: data?.id || null, ...data.attributes }
    : data;
  const response = {
    ...attributes,
  };

  if (data.relationships) {
    const keys = Object.keys(data.relationships);

    keys.forEach((key) => {
      response[key] = data.relationships[key].data?.id || null;
    });
  }

  return response;
};

const serializeIncludedAndRelationships = (data) => {
  const includedAndRelationships = {};

  for (const [key, value] of Object.entries(data.relationships)) {
    if (Array.isArray(value.data)) {
      const ids = value.data.map((x) => x.id);

      includedAndRelationships[`${key}Ids`] = ids;
    } else {
      includedAndRelationships[`${key}Id`] = value.data?.id;
    }
  }

  return {
    id: data.id,
    type: data.type,
    ...data.attributes,
    ...includedAndRelationships,
  };
};

const serializeRelationships = (data) => {
  const serializeRelationshipsObject = (d) => {
    if (d.relationships) {
      return serializeIncludedAndRelationships(d);
    }

    return {
      id: d.id,
      type: d.type,
      ...d.attributes,
    };
  };

  if (Array.isArray(data)) {
    return data.map((d) => serializeRelationshipsObject(d));
  }

  return serializeRelationshipsObject(data);
};

const serializeIncluded = (includedData) => {
  const type = {};
  const res = {};

  includedData
    .map((d) => d.type)
    .forEach((t) => {
      let index = 1;

      if (type[t]) {
        type[t] = index + 1;
      } else {
        type[t] = index;
      }
    });

  Object.values(type).forEach((t, i) => {
    const key = Object.keys(type)[i];

    if (t > 1) {
      res[`${key}s`] = serializeRelationships(
        includedData.filter((x) => x.type === key)
      );
    } else {
      res[`${key}s`] = serializeRelationships(
        includedData.find((x) => x.type === key)
      );
    }
  });

  return res;
};

const formatResponseApi = (res) => {
  if (res?.data && Array.isArray(res.data)) {
    const responseApi = {
      data: [],
      headers: res.headers,
      meta: res.meta,
      included: [],
    };

    res.data.forEach((data) => {
      responseApi.data.push(serializer(data));
    });

    if (res.included) {
      responseApi.included = serializeIncluded(res.included);
    }

    return responseApi;
  } else if (res?.included) {
    return {
      data: serializer(res.data),
      headers: res.headers,
      included: serializeIncluded(res.included),
    };
  } else if (res?.data) {
    return {
      data: serializer(res.data),
      headers: res.headers,
    };
  }

  return res;
};

export { formatResponseApi };
