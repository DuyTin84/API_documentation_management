const buildOpenApiDocument = (project, apiDocs) => {
  const paths = apiDocs.reduce((result, api) => {
    const endpoint = api.endpoint.startsWith("/") ? api.endpoint : `/${api.endpoint}`;
    const method = api.method.toLowerCase();

    result[endpoint] = result[endpoint] || {};
    result[endpoint][method] = {
      tags: [api.tag || "General"],
      summary: api.name,
      description: api.description,
      parameters: [...api.pathParams, ...api.queryParams].map((param) => ({
        name: param.key,
        in: api.pathParams.some((item) => item.key === param.key) ? "path" : "query",
        required: param.required,
        description: param.description,
        schema: {
          type: param.type || "string",
        },
      })),
      responses: api.responses.reduce((responses, response) => {
        responses[response.statusCode] = {
          description: response.description || "Response",
          content: {
            "application/json": {
              example: response.body,
            },
          },
        };
        return responses;
      }, {}),
    };

    if (["post", "put", "patch"].includes(method)) {
      result[endpoint][method].requestBody = {
        content: {
          "application/json": {
            example: api.requestBody,
          },
        },
      };
    }

    return result;
  }, {});

  return {
    openapi: "3.0.0",
    info: {
      title: project.name,
      description: project.description,
      version: "1.0.0",
    },
    servers: project.baseUrl ? [{ url: project.baseUrl }] : [],
    paths,
  };
};

module.exports = buildOpenApiDocument;
