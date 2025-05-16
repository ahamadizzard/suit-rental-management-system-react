import BlockedCustomers from "../../models/customers/blockedCustomersModel.js";

// Controller functions for BlockedCustomer
exports.getBlockedCustomers = async (req, res) => {
  try {
    const blockedCustomers = await BlockedCustomer.find();
    res.status(200).json(blockedCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBlockedCustomer = async (req, res) => {
  try {
    const newBlockedCustomer = new BlockedCustomer(req.body);
    await newBlockedCustomer.save();
    res.status(201).json(newBlockedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
