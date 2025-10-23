import mongoose from "mongoose";
import AutoIncrement from "mongoose-sequence";

const connection = mongoose;
const AutoIncrementFactory = AutoIncrement(connection);

const employeesSchema = new mongoose.Schema({
  employeeId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  nic: { type: String },
  telephone1: { type: String, required: true },
  telephone2: { type: String },
  address: { type: String },
  joinedDate: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  imgURL: {
    type: String,
    default: "https://avatar.iran.liara.run/public/boy?username=ash",
  },
  department: {
    type: String,
    default: "sales",
    enum: ["sales", "tailoring", "manager", "cashier"],
  },
  designation: {
    type: String,
    default: "staff",
    enum: [
      "staff",
      "supervisor",
      "manager",
      "admin",
      "cashier",
      "tailor",
      "helper",
    ],
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "resigned", "suspended"],
  },
  isBlocked: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
  // role: { type: String, enum: ["admin", "cashier", "manger"], default: "cashier" },
});

employeesSchema.plugin(AutoIncrementFactory, { inc_field: "employeeId" });

const Employees = mongoose.model("employees", employeesSchema);

export default Employees;
