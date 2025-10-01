import mongoose from "mongoose";
// import AutoIncrement from "mongoose-sequence";

// const connection = mongoose;
// const AutoIncrementFactory = AutoIncrement(connection);

const dryCleanSchema = new mongoose.Schema({
  drycleanId: { type: String, required: true },
  drycleanDate: { type: Date, required: true },
  itemGroupShortDesc: { type: String },
  itemCode: { type: String },
  itemShortDesc: { type: String },
  itemSize: { type: String },
  itemRentCount: { type: Number },
});
// dryCleanSchema.plugin(AutoIncrementFactory, { inc_field: "drycleanId" });
const DryClean = mongoose.model("dryclean", dryCleanSchema);
export default DryClean;
