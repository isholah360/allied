import mongoose from "mongoose";

const agroAlliedRegistrySchema = new mongoose.Schema(
  {
    farmerid: { type: Number, required: true },
    farmid: { type: Number, required: true },
    seasonid: { type: Number, required: true },
    businessTypeId: { type: Number, required: true },
    primaryProductId: { type: Number, required: true },
    productionCapacity: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AgroAlliedRegistry", agroAlliedRegistrySchema);