import express from "express";
import {
  createBooking,
  createBookingsBatch,
} from "../../controllers/sales/salesInvoiceDetailsController.js";

const salesInvoiceDetailsRouter = express.Router();

salesInvoiceDetailsRouter.post("/", createBooking);
salesInvoiceDetailsRouter.post("/batch", createBookingsBatch);

export default salesInvoiceDetailsRouter;
