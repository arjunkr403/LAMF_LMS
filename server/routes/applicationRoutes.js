import express from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, createApplication)
  .get(protect, getMyApplications);

router.get("/admin/all", protect, admin, getAllApplications);
router.put("/:id/status", protect, admin, updateApplicationStatus);

router.route("/:id").get(protect, getApplicationById);

export default router;
