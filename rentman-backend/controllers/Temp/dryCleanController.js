import DryClean from "../../models/inventory/dryCleanModel.js";

// Controller functions for DryClean
exports.getDryCleans = async (req, res) => {
  try {
    const dryCleans = await DryClean.find();
    res.status(200).json(dryCleans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addDryClean = async (req, res) => {
  try {
    const newDryClean = new DryClean(req.body);
    await newDryClean.save();
    res.status(201).json(newDryClean);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
