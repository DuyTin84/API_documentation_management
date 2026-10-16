const normalizeEndpoint = (endpoint = "") => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return path.replace(/\/:([A-Za-z0-9_-]+)(?=\/|$)/g, "/{$1}");
};

const getPathParameterKeys = (endpoint = "") =>
  [...normalizeEndpoint(endpoint).matchAll(/\{([^}/]+)\}/g)].map((match) => match[1]);

module.exports = { normalizeEndpoint, getPathParameterKeys };
