const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    userType: {
      type: String,
      trim: true,
      enum: ["User", "Partner", "Client", "Admin"],
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
