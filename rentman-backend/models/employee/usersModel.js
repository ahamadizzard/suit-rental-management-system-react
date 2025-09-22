import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employees" },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "manager", "cashier"],
    default: "cashier",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  imgURL: {
    type: String,
    default: "https://avatar.iran.liara.run/public/boy?username=ash",
  },
});

const User = mongoose.model("users", userSchema);

export default User;
