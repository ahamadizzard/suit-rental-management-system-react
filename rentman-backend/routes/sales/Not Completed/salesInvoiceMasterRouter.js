import express from "express";
import {
  getSalesInvoice,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} from "../../../controllers/sales/salesInvoiceMasterController.js";

const salesInvoiceMasterRouter = express.Router();

salesInvoiceMasterRouter.get("/salesInvoice", getSalesInvoice);
salesInvoiceMasterRouter.get("/salesInvoice/:invoiceId", getSalesInvoiceById);
salesInvoiceMasterRouter.post("/salesInvoice", createSalesInvoice);
salesInvoiceMasterRouter.put("/salesInvoice", updateSalesInvoice);
salesInvoiceMasterRouter.delete("/salesInvoice/:invoiceId", deleteSalesInvoice);

export default salesInvoiceMasterRouter;
