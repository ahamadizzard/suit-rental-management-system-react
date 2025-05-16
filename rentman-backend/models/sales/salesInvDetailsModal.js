import mongoose from "mongoose";

const salesInvDetailsSchema = new mongoose.Schema({
  salesInvNo: { type: Number, required: true },
  itemCode: { type: String, required: true },
  itemShortName: { type: String },
  deliveryDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  alterations: { type: String },
  isCompleted: { type: Boolean, default: false },
  salesInvCreatedOn: { type: Date, default: Date.now },
});

const SalesInvDetails = mongoose.model(
  "salesinvdetails",
  salesInvDetailsSchema
);

export default SalesInvDetails;
