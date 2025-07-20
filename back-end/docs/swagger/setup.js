/**
 * This file sets up and initializes Swagger documentation for the Warehouse Management System API
 */

const express = require("express");
const path = require("path");
const swaggerConfig = require("./swaggerConfig");

// Create a function to set up Swagger
function setupSwagger(app) {
  // Serve Swagger documentation at /api-docs endpoint
  app.use("/api-docs", swaggerConfig.serve, swaggerConfig.setup);

  // Additional route to redirect from /docs to Swagger UI
  app.get("/docs", (req, res) => {
    res.redirect("/api-docs");
  });

  // Serve static schema files if needed
  app.use("/swagger-schemas", express.static(path.join(__dirname, "schemas")));

  console.log("🚀 Swagger documentation initialized at /api-docs");
}

module.exports = setupSwagger;
