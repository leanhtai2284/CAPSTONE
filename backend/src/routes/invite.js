import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getPendingInvites,
  acceptInvite,
  rejectInvite,
} from "../controllers/groupController.js";

const router = express.Router();

router.use(protect);

router.get("/pending", getPendingInvites);
router.post("/:id/accept", acceptInvite);
router.post("/:id/reject", rejectInvite);

export default router;
