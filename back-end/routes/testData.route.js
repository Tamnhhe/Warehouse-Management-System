const express = require("express");
const router = express.Router();
const testDataController = require("../controllers/testData.controller");

// Import test data from docs/data
router.post("/import-data", testDataController.importTestData);
// Clear all test data except User
router.post("/clear-data", testDataController.clearTestData);

module.exports = router;
