import express from "express";
import {
  createBooking,
  createBookingsBatch,
  deleteBooking,
  getBookingById,
  getBookings,
  getBookingsByBookingDateRange,
  getBookingsByBookingStatus,
  getBookingsByCustomerId,
  getBookingsByItemId,
  updateBooking,
} from "../../controllers/sales/salesInvoiceDetailsController.js";

const salesInvoiceDetailsRouter = express.Router();

salesInvoiceDetailsRouter.post("/", createBooking);
salesInvoiceDetailsRouter.post("/batch", createBookingsBatch);
salesInvoiceDetailsRouter.put("/:id", updateBooking);
salesInvoiceDetailsRouter.delete("/:id", deleteBooking);
salesInvoiceDetailsRouter.get("/", getBookings);
salesInvoiceDetailsRouter.get("/:id", getBookingById);
salesInvoiceDetailsRouter.get("/customer/:customerId", getBookingsByCustomerId);
salesInvoiceDetailsRouter.get("/item/:itemId", getBookingsByItemId);
salesInvoiceDetailsRouter.get(
  "/status/:bookingStatus",
  getBookingsByBookingStatus
);
salesInvoiceDetailsRouter.get(
  "/dateRange/:startDate/:endDate",
  getBookingsByBookingDateRange
);

export default salesInvoiceDetailsRouter;
