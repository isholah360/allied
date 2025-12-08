import Admin from "../model/admin.model.js";
import Officer from "../model/officer.model.js";
import Farmer from "../model/farmer.model.js";
import Farm from "../model/farm.model.js";
import Crop from "../model/crop.model.js";
import Livestock from "../model/livestock.model.js";
import AgroAllied from "../model/agroallie.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { sendOfficerEmail } from "../model/utils.js";
import Notification from "../model/notification.model.js";

/* =============================
   ADMIN CONTROLLERS
============================= */
// Create Admin
export const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//sign in admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: "Invalid email or password" });

    // Check password
    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Sign JWT
    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Admin
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const updated = await Admin.findByIdAndUpdate(adminId, req.body, {
      new: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "Admin not found" });

    res.json({
      message: "Admin updated successfully",
      admin: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminAnalytics = async (req, res) => {
  try {
    // RAW COUNTS
    const [
      totalOfficers,
      totalFarmers,
      totalFarms,
      totalCrops,
      totalLivestock,
      totalAllied,
    ] = await Promise.all([
      Officer.countDocuments(),
      Farmer.countDocuments(),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Livestock.countDocuments(),
      AgroAllied.countDocuments(),
    ]);

    // Officer Activity Summary (linked records)
    const officerPerformance = await Officer.aggregate([
      {
        $lookup: {
          from: "farmers",
          localField: "_id",
          foreignField: "officerId",
          as: "farmerList",
        },
      },
      {
        $lookup: {
          from: "farms",
          localField: "_id",
          foreignField: "officerId",
          as: "farmList",
        },
      },
      {
        $lookup: {
          from: "crops",
          localField: "_id",
          foreignField: "officerId",
          as: "cropList",
        },
      },
      {
        $lookup: {
          from: "livestocks",
          localField: "_id",
          foreignField: "officerId",
          as: "livestockList",
        },
      },
      {
        $lookup: {
          from: "agroallieds",
          localField: "_id",
          foreignField: "officerId",
          as: "alliedList",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          farmers: { $size: "$farmerList" },
          farms: { $size: "$farmList" },
          crops: { $size: "$cropList" },
          livestock: { $size: "$livestockList" },
          allied: { $size: "$alliedList" },
        },
      },
    ]);

    // Crop Type Analytics
    const cropTypes = await Crop.aggregate([
      { $group: { _id: "$cropType", value: { $sum: 1 } } },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]);

    // Livestock Type Analytics
    const livestockTypes = await Livestock.aggregate([
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]);

    // AgroAllied Type Analytics
    const alliedTypes = await AgroAllied.aggregate([
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]);

    // Monthly Registrations
    const monthlyCrops = await Crop.aggregate([
      { $group: { _id: { $month: "$createdAt" }, value: { $sum: 1 } } },
      { $project: { month: "$_id", value: 1, _id: 0 } },
    ]);

    const monthlyLivestock = await Livestock.aggregate([
      { $group: { _id: { $month: "$createdAt" }, value: { $sum: 1 } } },
      { $project: { month: "$_id", value: 1, _id: 0 } },
    ]);

    const monthlyAllied = await AgroAllied.aggregate([
      { $group: { _id: { $month: "$createdAt" }, value: { $sum: 1 } } },
      { $project: { month: "$_id", value: 1, _id: 0 } },
    ]);

    // RESPONSE
    res.json({
      metrics: {
        totalOfficers,
        totalFarmers,
        totalFarms,
        totalCrops,
        totalLivestock,
        totalAllied,
      },
      analytics: {
        officerPerformance,
        cropTypes,
        livestockTypes,
        alliedTypes,
        monthlyCrops,
        monthlyLivestock,
        monthlyAllied,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   OFFICER CONTROLLERS
============================= */

export const createOfficer = async (req, res) => {
  try {
    const randomPassword = crypto.randomBytes(5).toString("hex");

    const officerData = {
      ...req.body,
      password: randomPassword,
    };

    const officer = await Officer.create(officerData);

    const officerRes = officer.toObject();
    delete officerRes.password;

    // Send email with credentials
    await sendOfficerEmail({
      gmailUser: process.env.GMAIL_USER,
      gmailPass: process.env.GMAIL_PASS,
      officerEmail: officer.email,
      officerPassword: randomPassword,
    });

    res.status(201).json(officerRes);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const loginOfficer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const officer = await Officer.findOne({ email });
    if (!officer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // const isMatch = bcryptjs.compareSync(password, officer.password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }

    const token = jwt.sign(
      { id: officer._id, email: officer.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        token,
        adminId: officer.adminId,
        officer: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
          username: officer.username,
          firstname: officer.firstname,
          lastname: officer.lastname,
        },
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOfficers = async (req, res) => {
  try {
    const officers = await Officer.find().populate("adminId", "name email");
    delete officers.password;
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOfficerDetails = async (req, res) => {
  try {
    const { officerId } = req.params;

    const officer = await Officer.findById(officerId).select("-password");
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    // RAW DATA
    const farmers = await Farmer.find({ officerId });
    const farms = await Farm.find({ officerId });
    const crops = await Crop.find({ officerId });
    const livestock = await Livestock.find({ officerId });
    const agroAllieds = await AgroAllied.find({ officerId });

    // ===== ANALYTICS SECTION ===== //

    // ✔ Counts
    const metrics = {
      totalFarmers: farmers.length,
      totalFarms: farms.length,
      totalCrops: crops.length,
      totalLivestock: livestock.length,
      totalAllied: agroAllieds.length,
    };

    // ✔ Crop Type Distribution
    const cropTypes = await Crop.aggregate([
      { $match: { officerId } },
      { $group: { _id: "$cropType", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    // ✔ Livestock Type Distribution
    const livestockTypes = await Livestock.aggregate([
      { $match: { officerId } },
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]);

    // ✔ Farms per Farmer
    const farmsPerFarmer = await Farm.aggregate([
      { $match: { officerId } },
      { $group: { _id: "$farmerId", farms: { $sum: 1 } } },
      {
        $lookup: {
          from: "farmers",
          localField: "_id",
          foreignField: "_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },
      { $project: { farmer: "$farmer.name", farms: 1 } },
    ]);

    // ✔ Monthly Crop count
    const monthlyCrops = await Crop.aggregate([
      { $match: { officerId } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          value: { $sum: 1 },
        },
      },
      { $project: { month: "$_id", value: 1, _id: 0 } },
    ]);

    // ✔ Monthly Livestock count
    const monthlyLivestock = await Livestock.aggregate([
      { $match: { officerId } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          value: { $sum: 1 },
        },
      },
      { $project: { month: "$_id", value: 1, _id: 0 } },
    ]);

    // ✔ AgroAllied Type Distribution
    const alliedTypes = await AgroAllied.aggregate([
      { $match: { officerId } },
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]);

    // RESPONSE
    res.status(200).json({
      officer,
      farmers,
      farms,
      crops,
      livestock,
      agroAllieds,
      metrics,
      analytics: {
        cropTypes,
        livestockTypes,
        alliedTypes,
        farmsPerFarmer,
        monthlyCrops,
        monthlyLivestock,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;

    const updated = await Officer.findByIdAndUpdate(officerId, req.body, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updated) return res.status(404).json({ message: "Officer not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token").json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE OFFICER
export const deleteOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;

    const deleted = await Officer.findByIdAndDelete(officerId);
    if (!deleted) return res.status(404).json({ message: "Officer not found" });

    res.json({ message: "Officer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   FARMER CONTROLLERS
============================= */
export const createFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.create(req.body);
    res.status(201).json(farmer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFarmersByOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;
    const farmers = await Farmer.find({ officerId });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmers = async (req, res) => {
  try {
    const { officerId } = req.params;
    const farmers = await Farmer.find({});
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const farmers = await Farmer.find({ _id: id });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE FARMER
export const updateFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Farmer.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Farmer not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Farmer.findByIdAndDelete({ _id: id });
    if (!deleted) return res.status(404).json({ message: "Farmer not found" });

    res.json({ message: "Farmer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmerDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farms = await Farm.find({ farmerId });
    const crops = await Crop.find({ farmerId });
    const livestock = await Livestock.find({ farmerId });
    res.json({
      farmer,
      farms,
      crops,
      livestock,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   FARM CONTROLLERS
============================= */
export const createFarm = async (req, res) => {
  try {
    const farm = await Farm.create(req.body);
    res.status(201).json(farm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFarmsByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farms = await Farm.find({ farmerId });
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmsByOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;
    const farms = await Farm.find({ officerId });
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const farms = await Farm.find({ _id: id });
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmByFarmerId = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farms = await Farm.find({ farmerId });
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFarmDetails = async (req, res) => {
  try {
    const { farmId } = req.params;
    console.log(farmId);

    const farm = await Farm.findById({ _id: farmId })
      .populate("farmerId", "name phone address")
      .populate("officerId", "name email");

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const [crops, livestock, agroallied] = await Promise.all([
      Crop.find({ farmId }),
      Livestock.find({ farmId }),
      AgroAllied.find({ farmId }).populate("farmerId farmId officerId"),
      ,
    ]);
    res.json({
      farm,
      crops,
      livestock,
      agroallied,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Farm.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!crop) return res.status(404).json({ error: "Farm not found" });

    res.json(crop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Farm.findByIdAndDelete(id);

    if (!crop) return res.status(404).json({ error: "Farm not found" });

    res.json({ message: "Farm deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   CROP CONTROLLERS
============================= */
export const createCrop = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json(crop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCropsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const crops = await Crop.find({ farmId });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCrops = async (req, res) => {
  try {
    const { farmId } = req.params;
    const crops = await Crop.find();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getCropById = async (req, res) => {
  try {
    const { id } = req.params;
    const crops = await Crop.find({ _id: id });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!crop) return res.status(404).json({ error: "Crop not found" });

    res.json(crop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findByIdAndDelete(id);

    if (!crop) return res.status(404).json({ error: "Crop not found" });

    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   LIVESTOCK CONTROLLERS
============================= */
export const createLivestock = async (req, res) => {
  try {
    const livestock = await Livestock.create(req.body);
    res.status(201).json(livestock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLivestockByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const livestock = await Livestock.find({ farmId });
    res.json(livestock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET LIVESTOCK
export const getLivestock = async (req, res) => {
  try {
    const { farmId } = req.params;
    const livestock = await Livestock.find();
    res.json(livestock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getLivestockById = async (req, res) => {
  try {
    const { id } = req.params;
    const livestock = await Livestock.find({ _id: id });
    res.json(livestock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLivestock = async (req, res) => {
  try {
    const { id } = req.params;

    const livestock = await Livestock.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!livestock)
      return res.status(404).json({ error: "Livestock not found" });

    res.json(livestock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE LIVESTOCK
export const deleteLivestock = async (req, res) => {
  try {
    const { id } = req.params;

    const livestock = await Livestock.findByIdAndDelete(id);

    if (!livestock)
      return res.status(404).json({ error: "Livestock not found" });

    res.json({ message: "Livestock deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AGROALLIED

export const createAgroAllied = async (req, res) => {
  try {
    const newRecord = new AgroAllied(req.body);
    const saved = await newRecord.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
export const getAllAgroAllied = async (req, res) => {
  try {
    const records = await AgroAllied.find()
      .populate("officerId", "name email")
      .populate("farmerId", "name phone address")
      .populate("farmId", "name location size");

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
export const getAgroAlliedById = async (req, res) => {
  try {
    const record = await AgroAllied.findById(req.params.id)
      .populate("officerId", "name email")
      .populate("farmerId", "name phone address")
      .populate("farmId", "name location size");

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY officerId
export const getAlliedByOfficerId = async (req, res) => {
  try {
    const { officerId } = req.params;

    const records = await AgroAllied.find({ officerId })
      .populate("officerId", "name email")
      .populate("farmerId", "name phone address")
      .populate("farmId", "name location size");

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY farmerId
export const getAlliedByFarmerId = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const records = await AgroAllied.find({ farmerId })
      .populate("officerId", "name email")
      .populate("farmerId", "name phone address")
      .populate("farmId", "name location size");

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY farmId
export const getAlliedByFarmId = async (req, res) => {
  try {
    const { farmId } = req.params;

    const records = await AgroAllied.find({ farmId })
      .populate("officerId", "name email")
      .populate("farmerId", "name phone address")
      .populate("farmId", "name location size");

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
export const updateAgroAllied = async (req, res) => {
  try {
    const updated = await AgroAllied.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Record not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteAgroAllied = async (req, res) => {
  try {
    const deleted = await AgroAllied.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE notification
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET all notifications (optionally for a specific user)
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId } : {};

    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET all notifications (optionally for a specific user)
export const getAllNotification = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET all notifications by  getNotificationsById
export const getNotificationsById = async (req, res) => {
  try {
    const { id } = req.query;

    const notifications = await Notification.find({
      _id: id,
    });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE notification
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
