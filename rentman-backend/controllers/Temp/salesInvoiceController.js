import SalesInvoice from "../../models/sales/salesInvoiceModel.js";

// Controller functions for SalesInvoice
exports.getSalesInvoices = async (req, res) => {
  try {
    const salesInvoices = await SalesInvoice.find();
    res.status(200).json(salesInvoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSalesInvoice = async (req, res) => {
  try {
    const newSalesInvoice = new SalesInvoice(req.body);
    await newSalesInvoice.save();
    res.status(201).json(newSalesInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
