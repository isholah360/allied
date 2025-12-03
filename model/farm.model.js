import mongoose from "mongoose";

const farmSchema = new mongoose.Schema({
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  size: Number, // in hectares or acres
  soilType: String
}, { timestamps: true });

export default mongoose.model('Farm', farmSchema);
