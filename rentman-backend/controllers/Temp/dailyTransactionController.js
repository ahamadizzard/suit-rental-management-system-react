import DailyTransaction from "../../models/sales/dailyTransactionModel.js";

// Controller functions for DailyTransaction
exports.getDailyTransactions = async (req, res) => {
  try {
    const dailyTransactions = await DailyTransaction.find();
    res.status(200).json(dailyTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addDailyTransaction = async (req, res) => {
  try {
    const newDailyTransaction = new DailyTransaction(req.body);
    await newDailyTransaction.save();
    res.status(201).json(newDailyTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
