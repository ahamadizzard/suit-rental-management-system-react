import express from "express";
import {
  getSalesInvoice,
  getSalesInvoiceById,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} from "../controllers/sales/salesInvoiceController.js";

const salesInvoiceRouter = express.Router();

salesInvoiceRouter.get("/salesInvoice", getSalesInvoice);
salesInvoiceRouter.get("/salesInvoice/:invoiceId", getSalesInvoiceById);
salesInvoiceRouter.post("/salesInvoice", createSalesInvoice);
salesInvoiceRouter.put("/salesInvoice", updateSalesInvoice);
salesInvoiceRouter.delete("/salesInvoice/:invoiceId", deleteSalesInvoice);

export default salesInvoiceRouter;
