import mongoose from "mongoose";

const livestockSchema = new mongoose.Schema({
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  type: { type: String, required: true }, // e.g., Cattle, Goat, Chicken
  breed: String,
  count: Number,
  dateAcquired: Date
}, { timestamps: true });

export default mongoose.model('Livestock', livestockSchema);
