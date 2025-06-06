const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  action: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  schoolId: { type: Schema.Types.ObjectId, ref: "School" },
  actionType: { type: String, required: true }, // delete, update, create, info
  createdBy: {
    type: Schema.Types.ObjectId,
    refPath: "model_type",
  },
  model_type: {
    type: String,
    enum: ["Student", "Teacher", "School"],
    required: true,
  },
});

module.exports = mongoose.model("logs", LogSchema);
