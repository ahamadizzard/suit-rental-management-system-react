import GroupMaster from "../../models/inventory/groupMasterModel.js";

// Controller functions for GroupMaster
exports.getGroupMasters = async (req, res) => {
  try {
    const groupMasters = await GroupMaster.find();
    res.status(200).json(groupMasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addGroupMaster = async (req, res) => {
  try {
    const newGroupMaster = new GroupMaster(req.body);
    await newGroupMaster.save();
    res.status(201).json(newGroupMaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
