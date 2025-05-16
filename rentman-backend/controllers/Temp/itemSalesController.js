import ItemSales from "../../models/sales/itemSalesModel";

// Controller functions for ItemSales
exports.getItemSales = async (req, res) => {
  try {
    const itemSales = await ItemSales.find();
    res.status(200).json(itemSales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItemSale = async (req, res) => {
  try {
    const newItemSale = new ItemSales(req.body);
    await newItemSale.save();
    res.status(201).json(newItemSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
