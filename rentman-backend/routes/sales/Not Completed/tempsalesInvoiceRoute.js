import express from "express";
import {
  generateInvoiceNumber,
  createSalesInvoice,
} from "../../controllers/sales/salesInvoiceController.js";

const router = express.Router();

// Generate invoice number endpoint
router.get("/generate-invoice-no", async (req, res) => {
  try {
    const invoiceNo = await generateInvoiceNumber();
    res.json({ success: true, invoiceNo });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create sales invoice endpoint
router.post("/", createSalesInvoice);

export default router;
