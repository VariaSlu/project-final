import mongoose from "mongoose";

const kidSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthdate: { type: Date, required: true },

  // optional: male/female/other
  sex: { type: String, enum: ["boy", "girl", "other"], default: "other" },

  // optional: current height in cm
  height: { type: Number, min: 40, max: 200 },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Kid", kidSchema);
