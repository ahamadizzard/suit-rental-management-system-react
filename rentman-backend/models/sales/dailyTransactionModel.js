import mongoose from "mongoose";

const dailyTransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  transactionType: { type: String, required: true }, // 'RENT_BOOKING' / 'returns' / 'expenses' / 'purchases' / 'other' / 'drawings'
  transactionDesc: { type: String },
  creditAmount: { type: Number },
  debitAmount: { type: Number },
});
const DailyTransaction = mongoose.model(
  "dailytransaction",
  dailyTransactionSchema
);

export default DailyTransaction;
