import DailyTransaction from "../../models/sales/dailyTransactionModel.js";
import DryClean from "../../models/inventory/dryCleanModel.js";
// import dayjs from "dayjs";
// Add daily transaction
export const addDailyTransaction = async (req, res) => {
  const {
    transactionId,
    transactionDate,
    invoiceNo,
    creditAmount,
    debitAmount,
    transactionDesc,
    transactionType,
  } = req.body;
  const newDailyTransaction = new DailyTransaction({
    transactionId,
    transactionDate,
    invoiceNo,
    creditAmount,
    debitAmount,
    transactionDesc,
    transactionType,
  });
  try {
    await newDailyTransaction.save();
    res.status(200).json(newDailyTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveDrycleanAndTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, dailyTransaction } = req.body;

    // 1. Save dryclean items
    await DryClean.insertMany(items, { session });
    console.log("Dryclean items saved:", items);
    // 2. Save daily transaction
    const newTransaction = new DailyTransaction(dailyTransaction);
    await newTransaction.save({ session });
    console.log("Daily transaction saved:", newTransaction);
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

// Get daily transactions
export const getDailyTransactions = async (req, res) => {
  try {
    const dailyTransactions = await DailyTransaction.find();
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all transactions
// export const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await DailyTransaction.find().sort({ transactionDate: -1 });
//     res.status(200).json(transactions);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// Get daily transaction by ID
export const getDailyTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const dailyTransaction = await DailyTransaction.findById(id);
    if (!dailyTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(dailyTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// modify daily transactions
export const modifyDailyTransaction = async (req, res) => {
  const { id } = req.params;
  const { date, amount, description, type } = req.body;
  try {
    const updatedTransaction = await DailyTransaction.findByIdAndUpdate(
      id,
      { date, amount, description, type },
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete daily transaction
export const deleteDailyTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTransaction = await DailyTransaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily transactions by date range
export const getDailyTransactionsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const dailyTransactions = await DailyTransaction.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily transactions by type
export const getDailyTransactionsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const dailyTransactions = await DailyTransaction.find({ type });
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get daily transactions by description
export const getDailyTransactionsByDescription = async (req, res) => {
  const { description } = req.params;
  try {
    const dailyTransactions = await DailyTransaction.find({
      description: { $regex: description, $options: "i" },
    });
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get daily transactions by amount range
export const getDailyTransactionsByAmountRange = async (req, res) => {
  const { minAmount, maxAmount } = req.params;
  try {
    const dailyTransactions = await DailyTransaction.find({
      amount: { $gte: parseFloat(minAmount), $lte: parseFloat(maxAmount) },
    });
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get daily transactions by date
export const getDailyTransactionsByDate = async (req, res) => {
  const { date } = req.params; // expecting "YYYY-MM-DD"
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // console.log("Fetching transactions from", start, "to", end);

    const dailyTransactions = await DailyTransaction.find({
      transactionDate: { $gte: start, $lte: end },
    }).sort({ transactionDate: 1 });

    res.status(200).json(dailyTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
