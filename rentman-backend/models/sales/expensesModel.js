import mongoose from "mongoose";

const expensesSchema = new mongoose.Schema({
  expenseId: { type: String, required: true },
  expenseDate: { type: Date, required: true },
  expenseType: { type: String, required: true },
  expenseDesc: { type: String },
  expenseAmount: { type: Number, required: true },
});
const Expenses = mongoose.model("expenses", expensesSchema);

export default Expenses;
