import mongoose from "mongoose";

const heldBookingMasterSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  itemAlteration: { type: String },
  itemType: { type: String },
  itemCode: { type: String, required: true },
  itemShortName: { type: String },
  itemSize: { type: String },
  invoiceNumber: { type: String, required: true },
  itemQty: { type: Number, required: true },
  itemPrice: { type: Number },
  deliveryDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  modifiedOn: { type: Date },
});
const HeldBookingMaster = mongoose.model(
  "heldbookingmaster",
  heldBookingMasterSchema
);

export default HeldBookingMaster;
