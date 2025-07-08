import express from "express";
import {
  getSalesInvoice,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} from "../../../controllers/sales/salesInvoiceMasterController.js";

const salesInvoiceMasterRouter = express.Router();

salesInvoiceMasterRouter.get("/", getSalesInvoice);
salesInvoiceMasterRouter.get("/salesInvoice/:invoiceId", getSalesInvoiceById);
salesInvoiceMasterRouter.post("/", createSalesInvoice);
salesInvoiceMasterRouter.put("/salesInvoice/:invoiceId", updateSalesInvoice);
salesInvoiceMasterRouter.delete("/salesInvoice/:invoiceId", deleteSalesInvoice);

export default salesInvoiceMasterRouter;
