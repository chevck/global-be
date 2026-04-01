const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BudgetUser",
      required: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    plannedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    actualSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
