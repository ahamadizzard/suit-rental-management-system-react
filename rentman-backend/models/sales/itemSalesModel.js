import mongoose from "mongoose";

const itemSalesSchema = new mongoose.Schema({
  itemSalesId: { type: String, required: true },
  itemCode: { type: String, required: true },
  salesType: { type: String, required: true },
  salesDate: { type: Date, required: true },
  salesDesc: { type: String },
  salesAmount: { type: Number, required: true },
});

const ItemSales = mongoose.model("itemsales", itemSalesSchema);

export default ItemSales;
