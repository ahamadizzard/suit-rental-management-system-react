import express from "express";
import { heldSalesInvoice } from "../controllers/heldSalesInvoiceController.js";

const heldSalesInvoiceRouter = express.Router();

heldSalesInvoiceRouter.post("/heldSalesInvoice", heldSalesInvoice);

export default heldSalesInvoiceRouter;
