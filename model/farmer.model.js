import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: true },
  name: { type: String, required: true },
  nationalId: { type: String, unique: true, required: true },
  phone: String,
  address: String, 
  houseHold: Number,
  age: Number,
  lga: String,
  email: { type: String, unique: false}
}, { timestamps: true });

export default mongoose.model('Farmer', farmerSchema);
