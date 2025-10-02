import mongoose from "mongoose";

const dailyTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceNo: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    transactionType: {
      type: String,
      required: true,
      enum: [
        "RENT_BOOKING",
        "RENT_BOOKING_UPDATE",
        "RETURNS",
        "EXPENSES",
        "PURCHASES",
        "OTHER",
        "DRAWINGS",
        "DRY_CLEAN",
      ],
    },
    transactionDesc: { type: String },
    creditAmount: { type: Number, default: 0 },
    debitAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
); // optional: adds createdAt and updatedAt

// Specify exact collection name to match MongoDB
const DailyTransaction = mongoose.model(
  "DailyTransaction", // model name
  dailyTransactionSchema,
  "dailytransactions" // exact collection name in MongoDB
);

export default DailyTransaction;
