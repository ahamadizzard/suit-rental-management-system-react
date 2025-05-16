import mongoose from "mongoose";

const groupMasterSchema = new mongoose.Schema({
  groupId: { type: String },
  groupName: { type: String },
  groupShortName: { type: String },
  groupDescription: { type: String },
});

const GroupMaster = mongoose.model("groupmaster", groupMasterSchema);
