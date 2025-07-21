const mongoose = require("mongoose");

const BrancbSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Branch name is required"],
  },
  receiver: {
    type: String,
    required: [true, "Receiver name is required"],
  },
  address: {
    type: String,
    required: [true, "Branch address is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
  },
});

const Branch = mongoose.model("Branch", BrancbSchema);
module.exports = Branch;
