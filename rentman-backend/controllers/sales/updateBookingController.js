import mongoose from "mongoose";
import SalesInvoiceMaster from "../../models/sales/salesInvoiceMasterModel.js";
import SalesInvoiceDetails from "../../models/sales/salesInvoiceDetailsModel.js";

export const updateBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNo } = req.params; // ✅ invoice number from URL
    const { masterData, detailsData } = req.body; // ✅ updates from body

    if (!invoiceNo) {
      throw new Error("Invoice number is required");
    }

    // ✅ Update SalesInvoiceMaster if masterData provided
    let updatedMaster = null;
    if (masterData) {
      updatedMaster = await SalesInvoiceMaster.findOneAndUpdate(
        { invoiceNo },
        { ...masterData, modifiedOn: new Date() },
        { new: true, session }
      );

      if (!updatedMaster) {
        throw new Error("Invoice master not found");
      }
    } else {
      updatedMaster = await SalesInvoiceMaster.findOne({ invoiceNo }).session(
        session
      );
      if (!updatedMaster) {
        throw new Error("Invoice master not found");
      }
    }

    // ✅ If detailsData provided, replace old details
    if (detailsData && detailsData.length > 0) {
      // Delete old details
      await SalesInvoiceDetails.deleteMany({ invoiceNo }, { session });

      // Insert new details
      const detailsToInsert = detailsData.map((item) => ({
        ...item,
        invoiceNo,
        invoiceDate: item.invoiceDate,
        itemCode: item.itemCode,
        itemShortName: item.itemShortName,
        itemSize: item.itemSize,
        group: item.group,
        alteration: item.alteration,
        amount: item.amount,
        deliveryDate: item.deliveryDate,
        returnDate: item.returnDate,
        bookingStatus: item.bookingStatus,
        customerId: item.customerId,
        createdOn: item.invoiceDate,
        modifiedOn: new Date(),
      }));
      await SalesInvoiceDetails.insertMany(detailsToInsert, { session });
    }

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Invoice updated successfully",
      master: updatedMaster,
    });
  } catch (error) {
    // ❌ Rollback if error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

export const updateBookingWithDailyTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNo } = req.params; // ✅ invoice number from URL
    const { masterData, detailsData, transactionData } = req.body; // ✅ updates from body

    if (!invoiceNo) {
      throw new Error("Invoice number is required");
    }

    // ✅ Update SalesInvoiceMaster if masterData provided
    let updatedMaster = null;
    if (masterData) {
      updatedMaster = await SalesInvoiceMaster.findOneAndUpdate(
        { invoiceNo },
        { ...masterData, modifiedOn: new Date() },
        { new: true, session }
      );

      if (!updatedMaster) {
        throw new Error("Invoice master not found");
      }
    } else {
      updatedMaster = await SalesInvoiceMaster.findOne({ invoiceNo }).session(
        session
      );
      if (!updatedMaster) {
        throw new Error("Invoice master not found");
      }
    }

    // ✅ If detailsData provided, replace old details
    if (detailsData && detailsData.length > 0) {
      // Delete old details
      await SalesInvoiceDetails.deleteMany({ invoiceNo }, { session });

      // Insert new details
      const detailsToInsert = detailsData.map((item) => ({
        ...item,
        invoiceNo,
        invoiceDate: item.invoiceDate,
        itemCode: item.itemCode,
        itemShortName: item.itemShortName,
        itemSize: item.itemSize,
        group: item.group,
        alteration: item.alteration,
        amount: item.amount,
        deliveryDate: item.deliveryDate,
        returnDate: item.returnDate,
        bookingStatus: item.bookingStatus,
        customerId: item.customerId,
        createdOn: item.invoiceDate,
        modifiedOn: new Date(),
      }));
      await SalesInvoiceDetails.insertMany(detailsToInsert, { session });
    }

    // ✅ Add a new daily transaction
    transactionData = {
      transactionId: `${invoiceNo}-${Date.now()}`, // or use a UUID
      invoiceNo,
      transactionDate: updatedMaster.invoiceDate,
      transactionType: "RENT_BOOKING_UPDATE", // or other type as needed
      transactionDesc: "Booking Advance updated",
      creditAmount: updatedMaster.netTotal, // or appropriate amount
      debitAmount: 0,
    };

    await DailyTransaction.create([transactionData], { session });

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Invoice updated successfully",
      master: updatedMaster,
    });
  } catch (error) {
    // ❌ Rollback if error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};
