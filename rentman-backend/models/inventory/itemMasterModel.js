import mongoose from "mongoose";

const itemMasterSchema = new mongoose.Schema(
  {
    itemCode: { type: Number, required: true, unique: true },
    itemName: { type: String, required: true },
    itemShortDesc: { type: String, required: true },
    itemGroupShortDesc: { type: String, required: true },
    itemSize: { type: Number, required: true },
    itemPrice: { type: Number, required: true, default: 0 },
    itemDateAdded: { type: String, default: Date.now, format: "DD-MMM-YYYY" },
    itemMaterialType: { type: String, default: "" },
    itemMaterialVendor: { type: String, default: "" },
    itemRemarks: { type: String, default: "" },
    isSchoolItem: { type: Boolean, default: false },
    itemStatus: { type: String, default: "Available" }, // Available, Rented, DryClean, Blocked
    contributor: { type: String, default: "Blazor Hub" },
    itemBlockedReason: { type: String, default: "" },
    itemBlockedDate: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    itemRentCount: { type: Number, default: 0 },
    itemLastRented: { type: Date, default: "" },
    itemLastRentedInv: { type: String, default: "" },
    itemLastDryClean: { type: Date, default: "" },
    itemLastDryCleanRentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ItemMaster = mongoose.model("itemmaster", itemMasterSchema);

export default ItemMaster;
