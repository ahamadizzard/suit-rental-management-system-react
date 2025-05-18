import mongoose from "mongoose";

const groupMasterSchema = new mongoose.Schema(
  {
    groupId: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{3}$/.test(v); // Ensures exactly 3 digits
        },
        message: (props) =>
          `${props.value} is not a valid group ID! Must be 3 digits.`,
      },
    },
    groupName: {
      type: String,
      required: true,
    },
    groupShortName: {
      type: String,
      required: true,
      maxlength: 10,
    },
    groupDescription: String,
  },
  { timestamps: true }
);

const GroupMaster = mongoose.model("groupmaster", groupMasterSchema);

export default GroupMaster;
