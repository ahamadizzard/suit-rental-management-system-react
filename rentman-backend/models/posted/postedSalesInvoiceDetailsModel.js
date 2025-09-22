import mongoose from "mongoose";

const postedSalesInvoiceDetailsSchema = new mongoose.Schema({
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
  bookingStatus: { type: String, default: "Booked" },
  customerId: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
});

const PostedSalesInvoiceDetails = mongoose.model(
  "postedsalesinvoicedetails",
  postedSalesInvoiceDetailsSchema
);

export default PostedSalesInvoiceDetails;
