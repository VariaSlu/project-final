import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Kid", required: true },
    type: { type: String, enum: ["jacket", "pants", "boots", "hat", "top", "gloves", "other"], default: "other" },
    size: { type: String, required: true },
    season: { type: String, enum: ["winter", "spring", "summer", "autumn", "all"], default: "all" },
    status: { type: String, enum: ["current", "needed", "stored", "to-sell"], default: "current" },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
