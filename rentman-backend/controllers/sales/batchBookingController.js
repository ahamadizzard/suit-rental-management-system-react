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

    // Backend validation: block duplicate itemCodes except for 99991-99999
    const allowedMultiCodes = [
      99991, 99992, 99993, 99994, 99995, 99996, 99997, 99998, 99999,
    ];
    const codeCount = {};
    for (const detail of invoiceDetails) {
      const code = Number(detail.itemCode);
      if (!allowedMultiCodes.includes(code)) {
        const key = `${detail.invoiceNo}_${detail.itemCode}`;
        codeCount[key] = (codeCount[key] || 0) + 1;
        if (codeCount[key] > 1) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({
              message: `Duplicate itemCode ${detail.itemCode} not allowed for invoiceNo ${detail.invoiceNo}`,
            });
        }
      }
    }
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

export async function batchBookingDelete(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNo } = req.params; // get invoiceNo from URL

    // Delete the master record
    const masterResult = await SalesInvoiceMaster.deleteOne(
      { invoiceNo },
      { session }
    );

    // Delete the details records
    const detailsResult = await SalesInvoiceDetail.deleteMany(
      { invoiceNo },
      { session }
    );

    // Check if master invoice existed
    if (masterResult.deletedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Invoice not found" });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Invoice deleted successfully!",
      deletedDetails: detailsResult.deletedCount,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Invoice deletion failed",
      error: err.message,
    });
  }
}
