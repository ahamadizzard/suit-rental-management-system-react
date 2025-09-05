import express from "express";

import { updateBooking } from "../../controllers/sales/updateBookingController.js";

const updateBookingRouter = express.Router();

updateBookingRouter.put("/:invoiceNo", updateBooking);

export default updateBookingRouter;
