import mongoose from "mongoose";

const agroAlliedSchema = new mongoose.Schema(
  {
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    season: { type: String, required: true },
    businessType: { type: String, required: true },
    primaryProduct: { type: String, required: true },
    productionCapacity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AgroAllied", agroAlliedSchema);
