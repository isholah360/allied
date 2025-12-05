import express from "express";
import {
  createAdmin,
  createOfficer,
  getOfficers,
  createFarmer,
  getFarmersByOfficer,
  createFarm,
  createCrop,
  getCropsByFarm,
  createLivestock,
  getLivestockByFarm,
  getFarmDetails,
  getFarmerDetails,
  getOfficerDetails,
  loginOfficer,
  getFarmers,
  getFarms,
  getCrops,
  getLivestock,
  updateLivestock,
  deleteLivestock,
  updateCrop,
  deleteCrop,
  updateFarmer,
  deleteFarmer,
  updateOfficer,
  deleteOfficer,
  getFarmsByOfficer,
  logout,
  logoutAdmin,
  loginAdmin,
  updateAdmin,
  adminAnalytics,
  createAgroAllied,
  getAllAgroAllied,
  getAgroAlliedById,
  getAlliedByFarmId,
  getAlliedByOfficerId,
  getAlliedByFarmerId,
  getCropById,
  getLivestockById,
  getFarmByFarmerId,
} from "./controller/agro.controller.js";

import {
  createAgroAlliedRegistry,
  deleteAgroAlliedRegistry,
  getAlliedById,
  getAllRegistries,
  getByFarmerId,
  getByFarmId,
  updateAgroAlliedRegistry,
} from "./controller/allied.controller.js";

const router = express.Router();

// ADMIN
router.post("/admins/create", createAdmin);
router.post("/admins/login", loginAdmin);
router.post("/logout",  logoutAdmin);
router.put("/admins/:adminId", updateAdmin);
router.get("/admins/analytics", adminAnalytics);


// OFFICER
router.post("/officers/create", createOfficer);
router.post("/officers/login", loginOfficer);
router.post("/officers/logout", logout);
router.get("/get/officers", getOfficers);
router.put("/officers/:officerId", updateOfficer);
router.get("/officers/:officerId", getOfficerDetails);
router.delete("/officers/:officerId", deleteOfficer);


// FARMER
router.post("/farmers/create", createFarmer);
router.get("/farmers/:farmerId", getFarmersByOfficer);
router.get("/farmers/:farmerId/details", getFarmerDetails);
router.get("/get/farmers", getFarmers);
router.put("/farmers/:farmerId", updateFarmer);
router.delete("/farmers/:farmerId", deleteFarmer);


// FARM
router.post("/farms/create", createFarm);
router.get("/get/farms/all", getFarms);
router.get("/get/farms/:id", getByFarmId);
router.get("/farms/:farmerId", getFarmByFarmerId);
router.get("/farms/:farmId/details", getFarmDetails);
router.get("/get/farms/:officerId", getFarmsByOfficer);



// CROP
router.post("/crops/create", createCrop);
router.get("/crops/farm/:farmId", getCropsByFarm);
router.get("/get/crops/all", getCrops);
router.get("/get/crops/:id", getCropById);
router.put("/crops/update/:id", updateCrop);
router.delete("/crops/:id", deleteCrop);

// LIVESTOCK
router.post("/livestocks/create", createLivestock);
router.get("/livestock/farm/:farmId", getLivestockByFarm);
router.get("/get/livestocks/all", getLivestock);
router.get("/get/livestocks/:id", getLivestockById);
router.put("/livestock/:id", updateLivestock);
router.delete("/livestock/:id", deleteLivestock);


// AGROALLIED

router.post("/agroallied/create", createAgroAlliedRegistry);
router.get("/agroallied/getall", getAllRegistries);
router.get("/agroallied/farm/:farmid", getByFarmId);
router.get("/agroallied/farmer/:farmerid", getByFarmerId);
router.put("/agroallied/edit/:id", updateAgroAlliedRegistry);
router.delete("/agroallied/delete/:id", deleteAgroAlliedRegistry);

// ProAGROALLIED

router.post("/agroallied/pro/create", createAgroAllied);
router.get("/agroallied/pro/getall", getAllAgroAllied);
router.get("/agroallied/pro/:id", getAgroAlliedById);
router.get("/agroallied/farm/pro/:farmid", getAlliedByFarmId);
router.get("/agroallied/farm/pro/:officerid", getAlliedByOfficerId);
router.get("/agroallied/farmer/pro/:farmerid", getAlliedByFarmerId);
router.put("/agroallied/pro/edit/:id", updateAgroAlliedRegistry);
router.delete("/agroallied/pro/delete/:id", deleteAgroAlliedRegistry);

export default router;



// import express from "express";


// const router = express.Router();

// router.get("/test", (req, res) => {
//   res.send("Hello AgroAllied from routes!");
// });

// router.post("/agroallied/create", createAgroAlliedRegistry);
// router.get("/agroallied/getall", getAllRegistries);

// router.get("/agroallied/farm/:farmid", getByFarmId);
// router.get("/agroallied/farmer/:farmerid", getByFarmerId);

// router.put("/agroallied/edit/:id", updateAgroAlliedRegistry);
// router.delete("/agroallied/delete/:id", deleteAgroAlliedRegistry);

// export default router;
