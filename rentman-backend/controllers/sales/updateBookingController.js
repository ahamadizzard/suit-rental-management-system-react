import mongoose from "mongoose";
import SalesInvoiceMaster from "../../models/sales/salesInvoiceMasterModel.js";
import SalesInvoiceDetails from "../../models/sales/salesInvoiceDetailsModel.js";
import DailyTransaction from "../../models/sales/dailyTransactionModel.js";

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
      // Backend validation: block duplicate itemCodes except for 99991-99999
      const allowedMultiCodes = [
        99991, 99992, 99993, 99994, 99995, 99996, 99997, 99998, 99999,
      ];
      const codeCount = {};
      for (const detail of detailsData) {
        const code = Number(detail.itemCode);
        if (!allowedMultiCodes.includes(code)) {
          const key = `${invoiceNo}_${detail.itemCode}`;
          codeCount[key] = (codeCount[key] || 0) + 1;
          if (codeCount[key] > 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              error: `Duplicate itemCode ${detail.itemCode} not allowed for invoiceNo ${invoiceNo}`,
            });
          }
        }
      }
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
      // Backend validation: block duplicate itemCodes except for 99991-99999
      const allowedMultiCodes = [
        99991, 99992, 99993, 99994, 99995, 99996, 99997, 99998, 99999,
      ];
      const codeCount = {};
      for (const detail of detailsData) {
        const code = Number(detail.itemCode);
        if (!allowedMultiCodes.includes(code)) {
          const key = `${invoiceNo}_${detail.itemCode}`;
          codeCount[key] = (codeCount[key] || 0) + 1;
          if (codeCount[key] > 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              error: `Duplicate itemCode ${detail.itemCode} not allowed for invoiceNo ${invoiceNo}`,
            });
          }
        }
      }
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
    // Find previous advancePaid value
    // const prevMaster = await SalesInvoiceMaster.findOne({ invoiceNo }).session(
    //   session
    // );
    // const oldAdvance = prevMaster ? Number(prevMaster.advancePaid) || 0 : 0;
    // const newAdvance = Number(updatedMaster.advancePaid) || 0;
    // const advanceDiff = newAdvance - oldAdvance;

    // Use transactionId from frontend if provided
    let transactionId =
      transactionData && transactionData.transactionId
        ? transactionData.transactionId
        : `${invoiceNo}-${Date.now()}`;

    const txnData = {
      transactionId,
      invoiceNo,
      transactionDate: new Date(),
      transactionType: "RENT_BOOKING_UPDATE",
      transactionDesc: "Booking Advance updated",
      creditAmount: transactionData.advanceDiff || 10, // Use advanceDiff from frontend
      debitAmount: 0,
    };
    await DailyTransaction.create([txnData], { session });

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
