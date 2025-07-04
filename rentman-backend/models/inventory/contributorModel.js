import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema({
  contributorId: {
    type: Number,
    required: true,
    autoIncrement: true,
  },
  contributorName: {
    type: String,
    required: true,
    default: "Blazer Hub",
  },
  contributorEmail: {
    type: String,
  },
  contributorPhone: {
    type: String,
  },
  contributorAddress: {
    type: String,
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
  },
  amount: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Contributor = mongoose.model("contributor", contributorSchema);
export default Contributor;
