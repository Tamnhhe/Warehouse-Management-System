
const express = require("express");
const categoryRouter = express.Router();
const { CategoryController } = require("../controllers");

// Routes for managing categories
categoryRouter.get("/getAllCategories", CategoryController.getCategories);
categoryRouter.post("/addCategory", CategoryController.addCategory);
categoryRouter.put("/updateCategory/:id", CategoryController.updateCategory);
categoryRouter.put("/inactivateCategory/:id", CategoryController.inactiveCategory);

// Routes for managing subcategories
categoryRouter.post("/:categoryId/sub/add", CategoryController.addSubCategory);
categoryRouter.put("/:categoryId/sub/update/:subId", CategoryController.updateSubCategory);
categoryRouter.delete("/:categoryId/sub/delete/:subId", CategoryController.deleteSubCategory);

module.exports = categoryRouter;


