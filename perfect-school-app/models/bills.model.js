const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillingSchema = new Schema({
  billId: { type: String, required: true, unique: true },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  billItems: [
    {
      item: { type: String, required: true },
      price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
      },
    },
  ],
  term: {
    type: String,
    required: true,
    enum: ["First Term", "Second Term", "Third Term"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  accountDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
  },
  discount: { type: Number, min: 0 },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
  },
  paidStatus: { type: Boolean, default: false },
  isDraft: { type: Boolean, default: false },
  billLayoutType: {
    type: String,
    enum: ["standard", "modern", "minimal"],
    default: "standard",
  },
  totalAmount: { type: Number, min: 0 },
  session: { type: String, required: true },
  class: { type: String, required: true },
});

module.exports = mongoose.model("Bill", BillingSchema);
