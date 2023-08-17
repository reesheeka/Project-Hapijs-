const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    newsType: {
      type: String,
      trim: true,
      required: true,
      enum: ["Education", "World", "Latest"],
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: objectId,
      required: true,
      trim: true,
      ref: "user",
    },
    image: {
      type: String,
      required: true,
      trim:true
  },
    isDeleted: {
      type: Boolean,
      default: false 
    },
    deletedAt: {
      type: Date,
      default: null
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("news", newsSchema);
