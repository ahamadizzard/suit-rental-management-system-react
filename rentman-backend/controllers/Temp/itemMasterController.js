import ItemMaster from "../../models/inventory/itemMasterModel.js";

// Controller functions for ItemMaster
exports.getItemMasters = async (req, res) => {
  try {
    const itemMasters = await ItemMaster.find();
    res.status(200).json(itemMasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItemMaster = async (req, res) => {
  try {
    const newItemMaster = new ItemMaster(req.body);
    await newItemMaster.save();
    res.status(201).json(newItemMaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
