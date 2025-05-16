import mongoose from "mongoose";

const itemMasterSchema = new mongoose.Schema({
  itemCode: { type: Number, required: true, unique: true },
  itemShortName: { type: String, required: true },
  itemSize: { type: Number },
  itemGroup: { type: String },
  itemGroupDesc: { type: String },
  itemShortDesc: { type: String },
  itemPrice: { type: Number },
  itemName: { type: String },
  itemDateAdded: { type: Date, default: Date.now },
  itemMaterialType: { type: String },
  itemMaterialVendor: { type: String },
  itemRemarks: { type: String },
  itemRentCount: { type: Number, default: 0 },
  itemLastRented: { type: Date },
  itemLastRentedInv: { type: String },
  itemLastDryClean: { type: Date },
  itemImages: [],
  isSchoolItem: { type: Boolean, default: false },
  itemStatus: { type: String, default: "Available" }, // Available, Rented, DryClean, Blocked
  itemBlockedReason: { type: String },
  itemBlockedDate: { type: Date },
  isBlocked: { type: Boolean, default: false },
  contributor: { type: String },
});

const ItemMaster = mongoose.model("itemmaster", itemMasterSchema);

export default ItemMaster;
