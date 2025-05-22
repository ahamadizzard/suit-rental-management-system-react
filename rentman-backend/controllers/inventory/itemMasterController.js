import ItemMaster from "../../models/inventory/itemMasterModel.js";
// import groupMaster from "../../models/inventory/groupMasterModel.js";

export async function getItemMaster(req, res) {
  try {
    // Find all item masters in the database
    const itemMaster = await ItemMaster.find();
    // Return a 200 status code and the item masters
    res.status(200).json(itemMaster);
  } catch (error) {
    // If an error occurs, return a 500 status code and the error message
    res.status(500).json({ message: error.message });
  }
}

export async function getItemMasterById(req, res) {
  const itemCode = req.params.itemCode;
  try {
    const itemMaster = await ItemMaster.findById(itemCode);
    // If the item master is not found, return a 404 status code and a message
    if (!itemMaster) return res.status(404).send("Item not found");
    // Otherwise, return a 200 status code and the item master
    res.status(200).json(itemMaster);
  } catch (error) {
    // If an error occurs, return a 500 status code and the error message
    res.status(500).json({ message: error.message });
  }
}

// Export an async function to create a new item master
export async function createItemMaster(req, res) {
  // Create a new item master with the data from the request body
  const itemMaster = new ItemMaster({
    itemCode: req.body.itemCode,
    itemName: req.body.itemName,
    itemShortDesc: req.body.itemShortDesc,
    itemGroupShortDesc: req.body.itemGroupShortDesc,
    itemSize: req.body.itemSize,
    itemPrice: req.body.itemPrice,
    itemDateAdded: req.body.itemDateAdded,
    itemMaterialType: req.body.itemMaterialType,
    itemMaterialVendor: req.body.itemMaterialVendor,
    itemRemarks: req.body.itemRemarks,
    isSchoolItem: req.body.isSchoolItem,
    itemStatus: req.body.itemStatus,
    contributor: req.body.contributor,
    // itemBlockedReason: req.body.itemBlockedReason,
    // itemBlockedDate: req.body.itemBlockedDate,
    // itemRentCount: req.body.itemRentCount,
    // itemLastRented: req.body.itemLastRented,
    // itemLastRentedInv: req.body.itemLastRentedInv,
    // itemLastDryClean: req.body.itemLastDryClean,

    // isBlocked: req.body.isBlocked,
  });
  try {
    // Save the new item master to the database
    const savedItemMaster = await itemMaster.save();
    // Return a 201 status code and the saved item master
    res
      .status(201)
      .json({ message: "Item Created Successfully", savedItemMaster });
  } catch (error) {
    // If an error occurs, return a 400 status code and the error message
    res.status(400).json({ message: error.message });
  }
}
// Export an async function to update an item master
export async function updateItemMaster(req, res) {
  try {
    // Find an item master by id in the database
    const itemMaster = await ItemMaster.findById(req.params.id);
    // If the item master is not found, return a 404 status code and a message
    if (!itemMaster) return res.status(404).send("Item not found");
    // Find a group by group code in the database
    const group = await groupMaster.findOne({ groupCode: req.body.itemGroup });
    // If the group is not found, return a 404 status code and a message
    if (!group) return res.status(404).send("Group not found");
    // Update the item master with the data from the request body
    itemMaster.itemCode = req.body.itemCode;
    itemMaster.itemShortName = req.body.itemShortName;
    itemMaster.itemSize = req.body.itemSize;
    itemMaster.itemGroup = group._id; // Use the ObjectId of the group
    itemMaster.itemGroupDesc = req.body.itemGroupDesc;
    itemMaster.itemShortDesc = req.body.itemShortDesc;
    itemMaster.itemPrice = req.body.itemPrice;
    itemMaster.itemName = req.body.itemName;
    itemMaster.itemDateAdded = req.body.itemDateAdded;
    itemMaster.itemMaterialType = req.body.itemMaterialType;
    itemMaster.itemMaterialVendor = req.body.itemMaterialVendor;
    itemMaster.itemRemarks = req.body.itemRemarks;
    itemMaster.isSchoolItem = req.body.isSchoolItem;
    itemMaster.isBlocked = req.body.isBlocked;

    // Save the updated item master to the database
    const updatedItemMaster = await itemMaster.save();
    // Return a 200 status code and the updated item master
    res.status(200).json(updatedItemMaster);
  } catch (error) {
    // If an error occurs, return a 400 status code and the error message
    res.status(400).json({ message: error.message });
  }
}

// Get item by itemCode (not ID)
// In controller
export async function getItemByCode(req, res) {
  try {
    // Handle both string and numeric itemCodes
    const item = await ItemMaster.findOne({
      $or: [
        { itemCode: req.params.itemCode },
        { itemCode: parseInt(req.params.itemCode) },
      ],
    });

    if (!item) return res.status(404).send("Item not found");
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update item by itemCode
export async function updateItemByCode(req, res) {
  try {
    const item = await ItemMaster.findOneAndUpdate(
      { itemCode: req.params.itemCode },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).send("Item not found");
    res.status(200).json({
      message: "Item updated successfully",
      updatedItem: item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
