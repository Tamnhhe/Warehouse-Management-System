/**
 * Swagger configuration for API documentation
 */

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Warehouse Management System API",
      version: "1.0.0",
      description: "API Documentation for Warehouse Management System",
      contact: {
        name: "Admin",
        email: "admin@warehouse-management.com",
      },
    },
    servers: [
      {
        url: "http://localhost:9999",
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
    tags: [
      { name: "Authentication", description: "Authentication operations" },
      { name: "Users", description: "User operations" },
      { name: "Products", description: "Product operations" },
      { name: "Categories", description: "Category operations" },
      { name: "Inventory", description: "Inventory operations" },
      {
        name: "InventoryTransaction",
        description: "Inventory transaction operations",
      },
      { name: "Suppliers", description: "Supplier operations" },
      { name: "SupplierProducts", description: "Supplier product operations" },
      { name: "Stocktaking", description: "Stocktaking operations" },
    ],
  },
  apis: [
    "./docs/swagger/routes/*.js",
    "./models/*.js", // For schemas
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
};
