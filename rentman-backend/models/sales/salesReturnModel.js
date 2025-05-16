import mongoose from "mongoose";

const salesReturnSchema = new mongoose.Schema({
  returnId: { type: String, required: true },
  returnType: { type: String, required: true },
  returnDate: { type: Date, required: true },
  salesInvNo: { type: Number },
  returnDesc: { type: String },
  returnAmount: { type: Number },
});

const SalesReturn = mongoose.model("salesreturn", salesReturnSchema);
export default SalesReturn;
