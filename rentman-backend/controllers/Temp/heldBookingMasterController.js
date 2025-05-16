import HeldBookingMaster from "../../models/sales/heldBookingMasterModel.js";

// Controller functions for HeldBookingMaster
exports.getHeldBookingMasters = async (req, res) => {
  try {
    const heldBookingMasters = await HeldBookingMaster.find();
    res.status(200).json(heldBookingMasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addHeldBookingMaster = async (req, res) => {
  try {
    const newHeldBookingMaster = new HeldBookingMaster(req.body);
    await newHeldBookingMaster.save();
    res.status(201).json(newHeldBookingMaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
