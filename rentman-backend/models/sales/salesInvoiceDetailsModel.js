import mongoose from "mongoose";

// const bookingMasterSchema = new mongoose.Schema({
//   bookingId: { type: String, required: true },
//   userId: { type: String },
//   invoiceDate: { type: Date, required: true },
//   itemAlteration: { type: String },
//   itemType: { type: String },
//   itemCode: { type: String, required: true },
//   itemShortName: { type: String },
//   itemSize: { type: String },
//   invoiceNumber: { type: String, required: true },
//   itemQty: { type: Number, required: true },
//   itemPrice: { type: Number },
//   deliveryDate: { type: Date, required: true },
//   returnDate: { type: Date, required: true },
//   modifiedOn: { type: Date },
// });
// const BookingMaster = mongoose.model("bookingmaster", bookingMasterSchema);

// export default BookingMaster;

// rentman-backend/models/sales/bookingMasterModel.js
// const mongoose = require('mongoose');

const salesInvoiceDetailsSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  itemCode: { type: String, required: true },
  itemShortName: { type: String },
  itemSize: { type: Number },
  group: { type: String },
  alteration: { type: String },
  amount: { type: Number },
  deliveryDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  bookingStatus: { type: String, default: "Pending" },
  customerId: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
});

const SalesInvoiceDetails = mongoose.model(
  "salesinvoicedetails",
  salesInvoiceDetailsSchema
);

export default SalesInvoiceDetails;
