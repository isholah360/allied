import AgroAlliedRegistry from "../model/allied.model.js";

export const createAgroAlliedRegistry = async (req, res) => {
  try {
    const {
      farmid,
      farmerid,
      seasonid,
      businessTypeId,
      primaryProductId,
      productionCapacity,
    } = req.body;

    const newRegistry = new AgroAlliedRegistry({
      farmid,
      farmerid,
      seasonid,
      businessTypeId,
      primaryProductId,
      productionCapacity,
    });
    const savedRegistry = await newRegistry.save();
    res.status(201).json(savedRegistry);
  } catch (error) {}
};

export const getByFarmId = async (req, res) => {
  try {
    const { farmid } = req.params;
    const result = await AgroAlliedRegistry.find({ farmid });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAlliedById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AgroAlliedRegistry.find({ _id:id });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getByFarmerId = async (req, res) => {
  try {
    const { farmerid } = req.params;
    const result = await AgroAlliedRegistry.find({ farmerid });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRegistries = async (req, res) => {
  try {
    const registries = await AgroAlliedRegistry.find();
    res.status(200).json({ data: registries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAgroAlliedRegistry = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating registry with ID:", id);

    const updated = await AgroAlliedRegistry.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json({message:"your data has been updated"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAgroAlliedRegistry = async (req, res) => {
  try {
    const { id } = req.params;

    await AgroAlliedRegistry.findByIdAndDelete(id);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

