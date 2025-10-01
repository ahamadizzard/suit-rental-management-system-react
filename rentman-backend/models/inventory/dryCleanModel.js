import mongoose from "mongoose";

const dryCleanSchema = new mongoose.Schema({
  drycleanId: { type: String, required: true },
  drycleanDate: { type: Date, required: true },
  itemGroupShortDesc: { type: String },
  itemCode: { type: String },
  itemShortDesc: { type: String },
  itemSize: { type: String },
  itemRentCount: { type: Number },
  itemMasterPosted: { type: Boolean, default: false },
});

const DryClean = mongoose.model("dryclean", dryCleanSchema);
export default DryClean;
