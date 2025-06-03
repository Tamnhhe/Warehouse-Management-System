const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  account: {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  profile: {
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10,15}$/, "Invalid phone number format"],
    },
    avatar: {
      type: String,
    },
    dob: {
      type: Date,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    idCard: {
      type: Number,
      unique: true,
      required: false,
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "active", // khách hàng thường active ngay
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
