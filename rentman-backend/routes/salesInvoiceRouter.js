import express from "express";
import { salesInvoice } from "../controllers/salesInvoiceController.js";

const salesInvoiceRouter = express.Router();

salesInvoiceRouter.post("/salesInvoice", salesInvoice);

export default salesInvoiceRouter;
