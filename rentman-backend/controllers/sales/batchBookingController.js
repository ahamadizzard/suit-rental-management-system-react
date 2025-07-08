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
// Note: Ensure that the models SalesInvoice, SalesInvoiceDetail, and DailyTransaction are correctly defined in their respective files.
// This function assumes that the request body contains an object with `invoice`, `invoiceDetails`,
// and `dailyTransaction` properties, where `invoiceDetails` is an array of invoice detail objects.
// Adjust the model imports and structure as per your actual schema definitions.
// Make sure to handle the session properly to avoid memory leaks or uncommitted transactions.
// Also, ensure that the necessary error handling and validation are in place for production use.
// This code is designed to handle batch booking operations, saving an invoice, its details, and a daily transaction in a single transaction.
// It uses Mongoose sessions to ensure that all operations are atomic, meaning either all succeed or none do, maintaining data integrity.
// This is particularly useful in scenarios where you want to ensure that related data is consistently saved together, such as in financial transactions or booking systems.
// Make sure to test this function thoroughly, especially in scenarios where one of the saves might fail, to ensure that the transaction rolls back correctly and no partial data is left in the database.
// Also, consider adding validation for the incoming data to ensure that it meets the requirements of your application before attempting to save it to the database.
