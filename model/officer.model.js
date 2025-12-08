import mongoose from "mongoose";

const officerSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  username: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  address: String,
  lga: String,
  password: { type: String, required: true }
}, { 
  timestamps: true,
  toJSON: { 
    transform(doc, ret) {
      delete ret.password; 
      return ret;
    }
  } 
});

export default mongoose.model('Officer', officerSchema);
