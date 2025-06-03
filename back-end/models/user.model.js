const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
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
      required: false,
      trim: true,
      match: [/^\d{10,15}$/, 'Invalid phone number format'],
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
      required: false,
      enum: ['male', 'female'],
    },
    idCard: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  salary: {
    type: Number,
    required: true,
    min: 0,
  },
  role: {
    type: String,
    required: true,
    enum: ['manager', 'employee','customer'],
    default: 'customer',
  },
  type: {
    type: String,
    enum: ['fulltime', 'parttime'],
    default: 'parttime',
  },
  schedule: {
    workDays: {
      type: [String], // Ngày làm việc
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    shifts: {
      type: [String], // Ca làm việc (Chỉ áp dụng cho part-time)
      enum: ['Morning', 'Afternoon', 'Evening'],
    },
    startTime: {
      type: String, // Giờ bắt đầu làm việc (Dành cho full-time)
    },
    endTime: {
      type: String, // Giờ kết thúc làm việc (Dành cho full-time)
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'banned'],
    default: 'inactive',
  },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
