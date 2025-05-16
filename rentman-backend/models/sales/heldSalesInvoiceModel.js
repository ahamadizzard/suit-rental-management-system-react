import mongoose from "mongoose";

const heldSalesInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  customerId: { type: String },
  customerName: { type: String },
  customerAddress: { type: String },
  customerTel1: { type: String },
  customerTel2: { type: String },
  deliveryDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  totalAmount: { type: Number },
  totalDiscount: { type: Number },
  netTotal: { type: Number },
  payment1: { type: Number },
  payment2: { type: Number },
  payment3: { type: Number },
  advancePaid: { type: Number },
  balanceAmount: { type: Number },
  depositTaken: { type: String },
  depositAmount: { type: Number },
  nic1: { type: String },
  nic2: { type: String },
  remarks: { type: String },
  isDelivered: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date },
});
const HeldSalesInvoice = mongoose.model(
  "heldsalesinvoice",
  heldSalesInvoiceSchema
);

export default HeldSalesInvoice;
