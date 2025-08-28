import express from "express";
import {
  getSalesInvoice,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
  searchBookings,
} from "../../../controllers/sales/salesInvoiceMasterController.js";

const salesInvoiceMasterRouter = express.Router();

salesInvoiceMasterRouter.get("/", getSalesInvoice);
// add search route (was defined in the other router file) so mounted path /api/salesinvoice/search/:query works
salesInvoiceMasterRouter.get("/search/:query", searchBookings);
salesInvoiceMasterRouter.get("/salesInvoice/:invoiceId", getSalesInvoiceById);
salesInvoiceMasterRouter.post("/", createSalesInvoice);
salesInvoiceMasterRouter.put("/salesInvoice/:invoiceId", updateSalesInvoice);
salesInvoiceMasterRouter.delete("/salesInvoice/:invoiceId", deleteSalesInvoice);

export default salesInvoiceMasterRouter;
