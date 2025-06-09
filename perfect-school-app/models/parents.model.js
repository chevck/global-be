const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

module.exports = mongoose.model("Parents", parentSchema);
