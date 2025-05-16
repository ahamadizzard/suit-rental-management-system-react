import BookingMaster from "../../models/sales/bookingMasterModel.js";

// Controller functions for BookingMaster
exports.getBookingMasters = async (req, res) => {
  try {
    const bookingMasters = await BookingMaster.find();
    res.status(200).json(bookingMasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBookingMaster = async (req, res) => {
  try {
    const newBookingMaster = new BookingMaster(req.body);
    await newBookingMaster.save();
    res.status(201).json(newBookingMaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
