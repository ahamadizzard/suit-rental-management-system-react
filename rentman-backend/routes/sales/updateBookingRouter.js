import express from "express";

import {
  updateBooking,
  updateBookingWithDailyTransaction,
} from "../../controllers/sales/updateBookingController.js";

const updateBookingRouter = express.Router();

updateBookingRouter.put("/:invoiceNo", updateBooking);

// Add a new route for updating with daily transaction
updateBookingRouter.put(
  "/with-transaction/:invoiceNo",
  updateBookingWithDailyTransaction
);

export default updateBookingRouter;
