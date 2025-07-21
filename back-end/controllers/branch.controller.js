const Branch = require("../models/branch.model");

// Get all branches
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    return res.status(200).json({
      success: true,
      data: branches,
      message: "Branches retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: branch,
      message: "Branch retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new branch
exports.createBranch = async (req, res) => {
  try {
    const { name, receiver, address, phone, email } = req.body;

    // Check if branch with same name already exists
    const existingBranchName = await Branch.findOne({ name });
    if (existingBranchName) {
      return res.status(400).json({
        success: false,
        message: "Branch with this name already exists",
      });
    }

    // Check if branch with same phone number already exists
    const existingBranchPhone = await Branch.findOne({ phone });
    if (existingBranchPhone) {
      return res.status(400).json({
        success: false,
        message: "Branch with this phone number already exists",
      });
    }

    const branch = new Branch({
      name,
      receiver,
      address,
      phone,
      email,
    });

    const savedBranch = await branch.save();

    return res.status(201).json({
      success: true,
      data: savedBranch,
      message: "Branch created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update branch
exports.updateBranch = async (req, res) => {
  try {
    const { name, receiver, address, phone, email } = req.body;

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Check if another branch with the same name exists (excluding the current branch)
    if (name && name !== branch.name) {
      const existingBranchName = await Branch.findOne({
        name,
        _id: { $ne: req.params.id },
      });

      if (existingBranchName) {
        return res.status(400).json({
          success: false,
          message: "Branch with this name already exists",
        });
      }
    }

    // Check if another branch with the same phone exists (excluding the current branch)
    if (phone && phone !== branch.phone) {
      const existingBranchPhone = await Branch.findOne({
        phone,
        _id: { $ne: req.params.id },
      });

      if (existingBranchPhone) {
        return res.status(400).json({
          success: false,
          message: "Branch with this phone number already exists",
        });
      }
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      {
        name,
        receiver,
        address,
        phone,
        email,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedBranch,
      message: "Branch updated successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete branch
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    await Branch.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
