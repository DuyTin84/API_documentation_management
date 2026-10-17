const METHODS_WITH_REQUEST_BODY = new Set(["post", "put", "patch"]);
const RESERVED_HEADERS = new Set(["authorization", "content-type", "accept"]);
const { normalizeEndpoint, getPathParameterKeys } = require("../utils/endpointPath");
const { fail } = require("../utils/response");

const inferSchema = (value) => {
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value.length ? inferSchema(value[0]) : {},
    };
  }

  if (value === null) {
    return { type: "string", nullable: true };
  }

  if (value && typeof value === "object") {
    const properties = Object.entries(value).reduce((result, [key, item]) => {
      result[key] = inferSchema(item);
      return result;
    }, {});

    return Object.keys(properties).length
      ? { type: "object", properties }
      : { type: "object", additionalProperties: true };
  }

  if (typeof value === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" };
  }

  if (typeof value === "boolean") {
    return { type: "boolean" };
  }

  return { type: "string" };
};

const buildFieldSchema = (type = "string") => {
  if (type === "array") {
    return { type: "array", items: { type: "string" } };
  }

  if (type === "object") {
    return { type: "object", additionalProperties: true };
  }

  return { type };
};

const normalizeExample = (value, type) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (type === "number") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : value;
  }

  if (type === "boolean") {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
  }

  if (["object", "array"].includes(type) && typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  return value;
};

const buildParameter = (field, location) => {
  const parameter = {
    name: field.key,
    in: location,
    required: location === "path" ? true : Boolean(field.required),
    schema: buildFieldSchema(field.type),
  };

  if (field.description) {
    parameter.description = field.description;
  }

  const example = normalizeExample(field.value, field.type);
  if (example !== undefined) {
    parameter.example = example;
  }

  return parameter;
};

const buildPathParameters = (endpoint, pathParams = []) => {
  const pathKeys = getPathParameterKeys(endpoint);

  return pathKeys.map((key) => {
    const documentedParam = pathParams.find((item) => item.key === key);
    return buildParameter(documentedParam || { key, type: "string", required: true }, "path");
  });
};

const buildMediaType = (body) => ({
  schema: inferSchema(body),
  example: body,
});

const buildResponses = (responses = []) => {
  const responseItems = responses.length
    ? responses
    : [{ statusCode: 200, description: "Phản hồi thành công", body: {} }];
  const grouped = responseItems.reduce((result, response) => {
    const statusCode = String(response.statusCode || 200);
    result[statusCode] = result[statusCode] || [];
    result[statusCode].push(response);
    return result;
  }, {});

  return Object.fromEntries(Object.entries(grouped).map(([statusCode, variants]) => {
    const responseObject = { description: variants[0].description || "Response" };

    if (statusCode !== "204") {
      const bodies = variants.map((variant) => variant.body === undefined ? {} : variant.body);
      const mediaType = variants.length === 1
        ? buildMediaType(bodies[0])
        : {
          schema: { anyOf: bodies.map(inferSchema) },
          examples: Object.fromEntries(variants.map((variant, index) => [
            `example${index + 1}`,
            { summary: variant.description || `Ví dụ ${index + 1}`, value: bodies[index] },
          ])),
        };
      responseObject.content = { "application/json": mediaType };
    }

    return [statusCode, responseObject];
  }));
};

const buildOpenApiDocument = (project, apiDocs = []) => {
  const securitySchemes = {};

  const paths = apiDocs.reduce((result, api) => {
    const endpoint = normalizeEndpoint(api.endpoint);
    const method = api.method.toLowerCase();
    if (result[endpoint]?.[method]) {
      fail(`Không thể xuất OpenAPI: API ${api.method} ${endpoint} bị trùng sau khi chuẩn hóa`, 409);
    }
    const headers = api.headers || [];
    const authorizationHeader = headers.find(
      (header) => header.key?.toLowerCase() === "authorization"
    );
    const headerParameters = headers
      .filter((header) => !RESERVED_HEADERS.has(header.key?.toLowerCase()))
      .map((header) => buildParameter(header, "header"));
    const parameters = [
      ...buildPathParameters(endpoint, api.pathParams || []),
      ...(api.queryParams || []).map((param) => buildParameter(param, "query")),
      ...headerParameters,
    ];

    const operation = {
      tags: [api.tag || "General"],
      summary: api.name,
      responses: buildResponses(api.responses || []),
      "x-document-status": api.status || "draft",
    };

    if (api.description) {
      operation.description = api.description;
    }

    if (parameters.length) {
      operation.parameters = parameters;
    }

    if (authorizationHeader) {
      const authValue = String(authorizationHeader.value || "").trim();
      let schemeName = "authorizationHeader";
      let scheme = { type: "apiKey", in: "header", name: "Authorization" };

      if (/^Bearer(?:\s|$)/i.test(authValue)) {
        schemeName = "bearerAuth";
        scheme = { type: "http", scheme: "bearer" };
        if (/\bJWT\b/i.test(`${authValue} ${authorizationHeader.description || ""}`)) {
          scheme.bearerFormat = "JWT";
        }
      } else if (/^Basic(?:\s|$)/i.test(authValue)) {
        schemeName = "basicAuth";
        scheme = { type: "http", scheme: "basic" };
      }

      securitySchemes[schemeName] = scheme;
      operation.security = authorizationHeader.required
        ? [{ [schemeName]: [] }]
        : [{}, { [schemeName]: [] }];
    }

    if (api.status === "deprecated") {
      operation.deprecated = true;
    }

    const requestBody = api.requestBody === undefined ? {} : api.requestBody;
    if (METHODS_WITH_REQUEST_BODY.has(method) || api.requestBody === null || Object.keys(requestBody).length) {
      operation.requestBody = {
        content: {
          "application/json": buildMediaType(requestBody),
        },
      };
    }

    result[endpoint] = result[endpoint] || {};
    result[endpoint][method] = operation;
    return result;
  }, {});

  const tags = [...new Set(apiDocs.map((api) => api.tag || "General"))]
    .sort((first, second) => first.localeCompare(second))
    .map((name) => ({ name }));

  const document = {
    openapi: "3.0.3",
    info: {
      title: project.name,
      version: "1.0.0",
    },
    paths,
  };

  if (project.description) {
    document.info.description = project.description;
  }

  if (project.baseUrl) {
    document.servers = [{ url: project.baseUrl }];
  }

  if (tags.length) {
    document.tags = tags;
  }

  if (Object.keys(securitySchemes).length) {
    document.components = { securitySchemes };
  }

  return document;
};

module.exports = buildOpenApiDocument;
