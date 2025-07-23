const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "employee_action",
      "manager_approval",
      "inventoryEntry",
      "lowStock",
      "productUpdate",
      "transactionRequest",
    ],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  data: {
    type: String, // JSON string để lưu thêm data
    default: "{}",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Giữ lại các fields cũ để backward compatibility
  recipient: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: undefined,
  },
  relatedData: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
