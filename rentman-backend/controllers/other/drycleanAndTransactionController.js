import DailyTransaction from "../../models/sales/dailyTransactionModel.js";
import DryClean from "../../models/inventory/dryCleanModel.js";
// import dayjs from "dayjs";
// Add daily transaction
import mongoose from "mongoose";

export const saveDrycleanAndTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, dailyTransaction } = req.body;

    // 1. Save dryclean items
    await DryClean.insertMany(items, { session });
    // console.log("Dryclean items saved:", items);
    // 2. Save daily transaction
    const newTransaction = new DailyTransaction(dailyTransaction);
    await newTransaction.save({ session });
    // console.log("Daily transaction saved:", newTransaction);
    // ✅ Commit both if successful
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "Dryclean and transaction saved successfully." });
  } catch (error) {
    // ❌ Rollback everything if error
    await session.abortTransaction();
    session.endSession();

    res
      .status(500)
      .json({ message: "Failed to save. Rolled back.", error: error.message });
  }
};
