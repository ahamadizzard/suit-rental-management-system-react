import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: {
    type: Number,
    required: true,
    unique: true,
  },
  // customerId: { type: Number, required: true, autoIncrement: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String },
  customerEmail: { type: String },
  customerTel1: { type: String, required: true },
  customerTel2: { type: String },
  customerLastPurchaseDate: { type: Date },
  customerLastPurchaseInvoice: { type: String },
  customerJoinedDate: { type: Date },
  customerLastPurchaseAmount: { type: Number },
  customerTotalPurchaseAmount: { type: Number },
  customerTotalPurchaseCount: { type: Number },
  customerDiscountPercentage: { type: Number },
  isBlocked: { type: Boolean, default: false },
});
// Replace the pre('save') hook with this:
customerSchema.pre("validate", async function (next) {
  if (!this.customerId) {
    const lastCustomer = await this.constructor
      .findOne()
      .sort({ customerId: -1 });
    this.customerId = lastCustomer ? lastCustomer.customerId + 1 : 1;
  }
  next();
});

const CustomerMaster = mongoose.model("customers", customerSchema);

export default CustomerMaster;
