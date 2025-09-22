import express from "express";
import { postBooking } from "../../controllers/sales/postBookingController.js";

const postBookingRouter = express.Router();

postBookingRouter.put("/:invoiceNo", postBooking);

export default postBookingRouter;
