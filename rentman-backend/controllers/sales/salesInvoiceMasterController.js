// import SalesInvoice from "../../models/sales/salesInvoiceModel.js";
import SalesInvoiceMaster from "../../models/sales/salesInvoiceMasterModel.js";

// Export an async function to get all sales invoices
export async function getSalesInvoice(req, res) {
  try {
    // Find all sales invoices in the database
    const salesInvoices = await SalesInvoiceMaster.find();
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
    const salesInvoice = await SalesInvoiceMaster.findOne({
      invoiceId: invoiceId,
    });
    if (!salesInvoice) return res.status(404).send("Sales Invoice not found");
    res.status(200).json(salesInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// Export an async function to create a new sales invoice
export async function createSalesInvoice(req, res) {
  const salesInvoice = new SalesInvoiceMaster(req.body);
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
    const updatedSalesInvoice = await SalesInvoiceMaster.findOneAndUpdate(
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
    const deletedSalesInvoice = await SalesInvoiceMaster.findOneAndDelete({
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
    const lastSalesInvoice = await SalesInvoiceMaster.findOne(
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

export async function searchBookings(req, res) {
  // Accept query via path param (/search/:query) or query string (/search?q=...)
  const searchQuery = req.params.query || req.query.q || "";
  // console.log(
  //   "searchBookings called. pathQuery=",
  //   req.params.query,
  //   "queryString=",
  //   req.query.q
  // );
  try {
    // build flexible OR conditions
    const orConditions = [
      { invoiceNo: { $regex: searchQuery, $options: "i" } },
      { customerName: { $regex: searchQuery, $options: "i" } },
      { customerTel1: { $regex: searchQuery, $options: "i" } },
      { customerTel2: { $regex: searchQuery, $options: "i" } },
      { customerAddress: { $regex: searchQuery, $options: "i" } },
      { invoiceStatus: { $regex: searchQuery, $options: "i" } },
    ];

    // If the query looks like a number, also try matching invoiceNo stored as number
    const maybeNumber = Number(searchQuery);
    if (!Number.isNaN(maybeNumber)) {
      orConditions.push({ invoiceNo: maybeNumber });
      // also try exact-string match for invoiceNo if stored as string
      orConditions.push({
        invoiceNo: { $regex: `^${searchQuery}$`, $options: "i" },
      });
    }

    // If the query parses as a valid date, search invoiceDate, returnDate and deliveryDate for that day
    const parsedDate = new Date(searchQuery);
    if (!Number.isNaN(parsedDate.getTime())) {
      const start = new Date(parsedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsedDate);
      end.setHours(23, 59, 59, 999);
      orConditions.push({ invoiceDate: { $gte: start, $lte: end } });
      orConditions.push({ returnDate: { $gte: start, $lte: end } });
      orConditions.push({ deliveryDate: { $gte: start, $lte: end } });
    }

    // Run the query and let MongoDB sort by invoiceDate (descending)
    res.set("Cache-Control", "no-store"); // disable caching for debugging
    const bookings = await SalesInvoiceMaster.find({ $or: orConditions }).sort({
      invoiceDate: -1,
    });
    // console.log("searchBookings returning", bookings.length, "records");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
