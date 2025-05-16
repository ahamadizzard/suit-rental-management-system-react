import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerTel1: { type: String, required: true },
  customerTel2: { type: String },
  customerLastPurchaseDate: { type: Date },
  customerLastPurchaseInvoice: { type: String },
  isBlocked: { type: Boolean, default: false },
});

const Customers = mongoose.model("customers", customerSchema);

export default CustomerMaster;
