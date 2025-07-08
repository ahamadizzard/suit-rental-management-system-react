// import { salesInvoiceDetailsModel } from "../../models/sales/salesInvoiceDetailsModel.js";
import SalesInvoiceDetails from "../../models/sales/salesInvoiceDetailsModel.js";

// Create a single booking
export async function createBooking(req, res) {
  try {
    const booking = new SalesInvoiceDetails(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Batch create bookings
export async function createBookingsBatch(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.insertMany(req.body);
    res.status(201).json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
// Update a booking by ID
export async function updateBooking(req, res) {
  try {
    const booking = await SalesInvoiceDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete a booking by ID
export async function deleteBooking(req, res) {
  try {
    const booking = await SalesInvoiceDetails.findByIdAndDelete(req.params.id);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get all bookings
export async function getBookings(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get a booking by ID
export async function getBookingById(req, res) {
  try {
    const booking = await SalesInvoiceDetails.findById(req.params.id);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get bookings by customer ID
export async function getBookingsByCustomerId(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find({
      customerId: req.params.customerId,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get bookings by item ID
export async function getBookingsByItemId(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find({
      itemCode: req.params.itemId,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get bookings by booking status
export async function getBookingsByBookingStatus(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find({
      bookingStatus: req.params.bookingStatus,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get bookings by booking date range
export async function getBookingsByBookingDateRange(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find({
      bookingDate: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get bookings by booking date range and item ID
export async function getBookingsByBookingDateRangeAndItemId(req, res) {
  try {
    const bookings = await SalesInvoiceDetails.find({
      bookingDate: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
      itemId: req.params.itemId,
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
