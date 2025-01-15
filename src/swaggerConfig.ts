const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "This is the API documentation for the application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  };
  
  const swaggerOptions = {
    swaggerDefinition,
    apis: ["./src/routes/*.ts"], // Ajusta la ruta según tu estructura de proyecto
  };
  
  export default swaggerOptions;