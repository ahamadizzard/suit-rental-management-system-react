import mongoose from "mongoose";

const postedSalesInvoiceMasterSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  customerId: { type: String, default: "01" },
  customerName: { type: String, default: "Cash Customer" },
  customerAddress: { type: String },
  customerTel1: { type: String },
  customerTel2: { type: String },
  deliveryDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  totalAmount: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  netTotal: { type: Number, default: 0 },
  payment1: { type: Number, default: 0 },
  payment2: { type: Number, default: 0 },
  payment3: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  depositTaken: { type: String },
  depositAmount: { type: Number, default: 0 },
  nic1: { type: String },
  nic2: { type: String },
  remarks: { type: String },
  invoiceStatus: {
    type: String,
    default: "booked",
    enum: [
      "booked",
      "delivered",
      "returned",
      "cancelled",
      "returned_partial",
      "returned_overdue",
      "returned_issues",
    ],
  },
  isDelivered: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date },
  postedDate: { type: Date, default: Date.now() },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UsersModel",
    required: true,
  },

  // postedBy:{type:String} // manager ID
});
const PostedSalesInvoiceMaster = mongoose.model(
  "postedsalesinvoicemaster",
  postedSalesInvoiceMasterSchema
);

export default PostedSalesInvoiceMaster;
