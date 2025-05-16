import SalesReturn from "../../models/sales/salesReturnModel.js";

// Controller functions for SalesReturn
exports.getSalesReturns = async (req, res) => {
  try {
    const salesReturns = await SalesReturn.find();
    res.status(200).json(salesReturns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSalesReturn = async (req, res) => {
  try {
    const newSalesReturn = new SalesReturn(req.body);
    await newSalesReturn.save();
    res.status(201).json(newSalesReturn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
