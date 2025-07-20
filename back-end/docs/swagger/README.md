# Warehouse Management System API Documentation

## Overview

This directory contains the Swagger/OpenAPI documentation for the Warehouse Management System API. It provides a comprehensive, interactive documentation for all available API endpoints.

## Access the Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:9999/api-docs
```

## Directory Structure

```
docs/
└── swagger/
    ├── routes/                  # API endpoint documentation by resource
    │   ├── authentication.routes.js  # Authentication endpoints
    │   ├── users.routes.js      # User management endpoints
    │   ├── products.routes.js   # Product management endpoints
    │   ├── categories.routes.js # Category management endpoints
    │   ├── inventory.routes.js  # Inventory management endpoints
    │   └── ... other resource endpoints
    ├── swaggerConfig.js         # Swagger configuration
    ├── setup.js                 # Setup file for Express integration
    └── README.md                # This file
```

## Installation

To use the Swagger documentation, you need to install the required packages:

```bash
npm install --save swagger-jsdoc swagger-ui-express
```

These packages should be included in the project's package.json.

## How It Works

1. The documentation is generated using `swagger-jsdoc` from JSDoc comments in the route files.
2. The Swagger UI is served using `swagger-ui-express`.
3. The documentation is available at `/api-docs` when the server is running.

## Authentication

The API uses JWT (JSON Web Token) for authentication. To test authenticated endpoints:

1. First, use the login endpoint to obtain a token.
2. Click the "Authorize" button in the Swagger UI.
3. Enter the token in the format: `Bearer YOUR_TOKEN_HERE`.
4. Click "Authorize" to apply the token to all authenticated requests.

## Customizing the Documentation

To update or extend the documentation:

1. Add or modify the JSDoc comments in the route files under `docs/swagger/routes/`.
2. Update the schemas in the route files if needed.
3. The changes will be reflected in the Swagger UI when the server is restarted.

## Endpoint Groups

- **Authentication**: User login, registration, token management
- **Users**: User profile management
- **Products**: Product CRUD operations
- **Categories**: Category management
- **Inventory**: Inventory and shelving management
- **Suppliers**: Supplier management
- **SupplierProducts**: Supplier product relationship management
- **InventoryTransactions**: Inventory movement records
- **Stocktaking**: Inventory counting and adjustments
