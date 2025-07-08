import mongoose from "mongoose";

const dailyTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    autoIncrement: true,
  },
  invoiceNo: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  transactionType: { type: String, required: true }, // 'RENT_BOOKING' / 'returns' / 'expenses' / 'purchases' / 'other' / 'drawings'
  transactionDesc: { type: String },
  creditAmount: { type: Number, default: 0 },
  debitAmount: { type: Number, default: 0 },
});
const DailyTransaction = mongoose.model(
  "dailytransaction",
  dailyTransactionSchema
);

export default DailyTransaction;
