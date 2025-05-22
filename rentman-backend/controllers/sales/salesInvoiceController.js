import SalesInvoice from "../../models/sales/salesInvoiceModel.js";

// Export an async function to get all sales invoices
export async function getSalesInvoice(req, res) {
  try {
    // Find all sales invoices in the database
    const salesInvoices = await SalesInvoice.find();
    // Return a 200 status code and the sales invoices
    res.status(200).json(salesInvoices);
  } catch (error) {
    // If an error occurs, return a 500 status code and the error message
    res.status(500).json({ message: error.message });
  }
}
// Export an async function to get a sales invoice by ID
export async function getSalesInvoiceById(req, res) {
  const invoiceId = req.params.invoiceId;
  try {
    const salesInvoice = await SalesInvoice.findOne({ invoiceId: invoiceId });
    if (!salesInvoice) return res.status(404).send("Sales Invoice not found");
    res.status(200).json(salesInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Export an async function to create a new sales invoice
export async function createSalesInvoice(req, res) {
  const salesInvoice = new SalesInvoice(req.body);
  try {
    const newSalesInvoice = await salesInvoice.save();
    res.status(201).json({
      message: "Sales Invoice Created Successfully",
      newSalesInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
// Export an async function to update a sales invoice by ID
export async function updateSalesInvoice(req, res) {
  const invoiceId = req.params.invoiceId;
  try {
    const updatedSalesInvoice = await SalesInvoice.findOneAndUpdate(
      { invoiceId: invoiceId },
      req.body,
      { new: true }
    );
    if (!updatedSalesInvoice)
      return res.status(404).send("Sales Invoice not found");
    res.status(200).json({
      message: "Sales Invoice Updated Successfully",
      updatedSalesInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
// Export an async function to delete a sales invoice by ID
export async function deleteSalesInvoice(req, res) {
  const invoiceId = req.params.invoiceId;
  try {
    const deletedSalesInvoice = await SalesInvoice.findOneAndDelete({
      invoiceId: invoiceId,
    });
    if (!deletedSalesInvoice)
      return res.status(404).send("Sales Invoice not found");
    res.status(200).json({
      message: "Sales Invoice Deleted Successfully",
      deletedSalesInvoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Export an async function to get the last sales invoice ID
export async function getLastSalesInvoiceId(req, res) {
  try {
    const lastSalesInvoice = await SalesInvoice.findOne(
      {},
      {},
      { sort: { invoiceId: -1 } }
    );
    if (!lastSalesInvoice)
      return res.status(404).send("No sales invoices found");
    res.status(200).json({ lastSalesInvoiceId: lastSalesInvoice.invoiceId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
