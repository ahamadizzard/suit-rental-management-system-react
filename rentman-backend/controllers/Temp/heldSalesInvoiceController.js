import HeldSalesInvoice from "../../models/sales/heldSalesInvoiceModel.js";

// Controller functions for HeldSalesInvoice
exports.getHeldSalesInvoices = async (req, res) => {
  try {
    const heldSalesInvoices = await HeldSalesInvoice.find();
    res.status(200).json(heldSalesInvoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addHeldSalesInvoice = async (req, res) => {
  try {
    const newHeldSalesInvoice = new HeldSalesInvoice(req.body);
    await newHeldSalesInvoice.save();
    res.status(201).json(newHeldSalesInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
