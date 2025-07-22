const express = require("express");
const branchRouter = express.Router();
const branchController = require("../controllers/branch.controller");

branchRouter.get("/getAllBranches", branchController.getAllBranches);
branchRouter.get("/getBranchById/:id", branchController.getBranchById);
branchRouter.post("/createBranch", branchController.createBranch);
branchRouter.put("/updateBranch/:id", branchController.updateBranch);
branchRouter.delete("/deleteBranch/:id", branchController.deleteBranch);

module.exports = branchRouter;
