import express from "express";
import {
  createSalesInvoice,
  deleteSalesInvoice,
  getLastSalesInvoiceId,
  getSalesInvoice,
  getSalesInvoiceById,
  searchBookings,
  updateSalesInvoice,
} from "../../controllers/sales/salesInvoiceMasterController.js";

const salesInvoiceMasterRouter = express.Router();

salesInvoiceMasterRouter.post("/", createSalesInvoice);
salesInvoiceMasterRouter.get("/", getSalesInvoice);
salesInvoiceMasterRouter.get("/search/:query", searchBookings);
salesInvoiceMasterRouter.get("/:id", getSalesInvoiceById);
salesInvoiceMasterRouter.put("/:id", updateSalesInvoice);
salesInvoiceMasterRouter.delete("/:id", deleteSalesInvoice);
salesInvoiceMasterRouter.get("/lastId", getLastSalesInvoiceId);

export default salesInvoiceMasterRouter;
