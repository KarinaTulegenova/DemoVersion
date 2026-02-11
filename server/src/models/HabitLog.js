const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    habit: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["completed", "missed", "partial"], required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

habitLogSchema.index({ habit: 1, date: 1 });

module.exports = mongoose.model("HabitLog", habitLogSchema);
