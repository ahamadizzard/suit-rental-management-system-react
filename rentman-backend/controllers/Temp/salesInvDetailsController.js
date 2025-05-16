import SalesInvDetails from "../../models/sales/salesInvDetailsModal.js";

// Controller functions for SalesInvDetails
exports.getSalesInvDetails = async (req, res) => {
  try {
    const salesInvDetails = await SalesInvDetails.find();
    res.status(200).json(salesInvDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSalesInvDetail = async (req, res) => {
  try {
    const newSalesInvDetail = new SalesInvDetails(req.body);
    await newSalesInvDetail.save();
    res.status(201).json(newSalesInvDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
