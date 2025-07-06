import express from "express";
import { heldBooking } from "../controllers/heldBookingMasterController.js";

const heldBookingRouter = express.Router();

heldBookingRouter.post("/heldBooking", heldBooking);

export default heldBookingRouter;
