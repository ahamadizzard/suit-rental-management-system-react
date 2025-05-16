import mongoose from "mongoose";

const blockedCustomerSchema = new mongoose.Schema({
  customerId: { type: String },
  customerName: { type: String, required: true },
  customerAddress: { type: String },
  customerEmail: { type: String },
  customerTel1: { type: String },
  customerTel2: { type: String },
  custnic1: { type: String },
  custnic2: { type: String },
  reason: { type: String, required: true },
  blockedDate: { type: Date, default: Date.now },
});

const BlockedCustomers = mongoose.model(
  "blockedcustomers",
  blockedCustomerSchema
);
export default BlockedCustomers;
