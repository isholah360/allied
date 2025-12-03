import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  cropType: { type: String, required: true },
  variety: String,
  plantingDate: Date,
  harvestDate: Date,
  areaPlanted: Number // e.g., in acres
}, { timestamps: true });

export default mongoose.model('Crop', cropSchema);
