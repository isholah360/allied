import express from "express";
import {
  createAgroAlliedRegistry,
  deleteAgroAlliedRegistry,
  getAllRegistries,
  getByFarmerId,
  getByFarmId,
  updateAgroAlliedRegistry,
} from "./controller/allied.controller.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Hello AgroAllied from routes!");
});

router.post("/agroallied/create", createAgroAlliedRegistry);
router.get("/agroallied/getall", getAllRegistries);

router.get("/agroallied/farm/:farmid", getByFarmId);
router.get("/agroallied/farmer/:farmerid", getByFarmerId);

router.put("/agroallied/edit/:id", updateAgroAlliedRegistry);
router.delete("/agroallied/delete/:id", deleteAgroAlliedRegistry);

export default router;
