import express from "express";
import {
  createSalesInvoice,
  deleteSalesInvoice,
  getLastSalesInvoiceId,
  getSalesInvoice,
  searchBookings,
  updateSalesInvoice,
  deleteSalesInvoiceAndDetails,
  getSalesInvoiceMasterByInvoiceNo,
} from "../../controllers/sales/salesInvoiceMasterController.js";

const salesInvoiceMasterRouter = express.Router();

salesInvoiceMasterRouter.post("/", createSalesInvoice);
salesInvoiceMasterRouter.get("/", getSalesInvoice);
salesInvoiceMasterRouter.get("/search/:query", searchBookings);
salesInvoiceMasterRouter.get("/:invoiceNo", getSalesInvoiceMasterByInvoiceNo);
salesInvoiceMasterRouter.put("/:id", updateSalesInvoice);
salesInvoiceMasterRouter.delete("/:id", deleteSalesInvoice);
// Delete by invoiceNo (master + details) atomically
salesInvoiceMasterRouter.delete(
  "/byno/:invoiceNo",
  deleteSalesInvoiceAndDetails
);
salesInvoiceMasterRouter.get("/lastId", getLastSalesInvoiceId);

export default salesInvoiceMasterRouter;
