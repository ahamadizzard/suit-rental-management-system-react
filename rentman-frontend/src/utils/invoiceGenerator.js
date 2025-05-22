// utils/invoiceGenerator.js
import Invoice from "../models/invoiceModel.js"; // Your invoice model

export const generateInvoiceNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Find the highest invoice number for today
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${datePart}`),
  }).sort({ invoiceNumber: -1 }); // Get the highest number

  let serialNumber = "001"; // Default if no invoices exist today

  if (lastInvoice) {
    // Extract the last 3 digits and increment
    const lastSerial = parseInt(lastInvoice.invoiceNumber.slice(-3));
    serialNumber = (lastSerial + 1).toString().padStart(3, "0");
  }

  return `${datePart}${serialNumber}`;
};
