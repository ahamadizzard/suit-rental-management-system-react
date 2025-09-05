import mongoose from "mongoose";
import SalesInvoiceMaster from "../../models/sales/salesInvoiceMasterModel.js";
import SalesInvoiceDetail from "../../models/sales/salesInvoiceDetailsModel.js";
import DailyTransaction from "../../models/sales/dailyTransactionModel.js";

export async function batchBookingSave(req, res) {
  // export const batchBookingSave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { invoice, invoiceDetails, dailyTransaction } = req.body;

    // Save invoice
    const invoiceDoc = new SalesInvoiceMaster(invoice);
    await invoiceDoc.save({ session });

    // Save invoice details (array)
    await SalesInvoiceDetail.insertMany(invoiceDetails, { session });

    // Save daily transaction
    const dailyTxnDoc = new DailyTransaction(dailyTransaction);
    await dailyTxnDoc.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ message: "All saved successfully!" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Batch save failed", error: err.message });
  }
}
