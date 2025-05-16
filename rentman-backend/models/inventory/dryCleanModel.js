import mongoose from "mongoose";

const dryCleanSchema = new mongoose.Schema({
  drycleanId: { type: String },
  drycleanDate: { type: Date, required: true },
  itemType: { type: String },
  itemCode: { type: String },
  itemShortName: { type: String },
  itemSize: { type: String },
  itemRentCount: { type: Number },
});
const DryClean = mongoose.model("dryclean", dryCleanSchema);
export default DryClean;
