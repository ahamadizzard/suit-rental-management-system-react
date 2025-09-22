import SalesInvoiceDetails from "../../models/sales/salesInvoiceDetailsModel.js";
import SalesInvoiceMaster from "../../models/sales/salesInvoiceMasterModel.js";
import ItemMaster from "../../models/inventory/itemMasterModel.js";
import CustomerMaster from "../../models/customers/customersModel.js";
import PostedSalesInvoiceMaster from "../../models/posted/postedSalesInvoiceMasterModel.js";
import PostedSalesInvoiceDetails from "../../models/posted/postedSalesInvoiceDetailsModel.js";
import mongoose from "mongoose";

export async function postBooking(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoiceNo } = req.params;
    // const userId = req.users._id; // <-- manager performing the posting

    // 1. Get booking invoice
    const invoiceMaster = await SalesInvoiceMaster.findOne({
      invoiceNo,
    }).session(session);
    const invoiceDetails = await SalesInvoiceDetails.find({
      invoiceNo,
    }).session(session);

    if (!invoiceMaster) {
      throw new Error("Invoice not found");
    }

    // 2. Save copy into Posted collections with postedDate & postedBy
    await PostedSalesInvoiceMaster.create(
      [
        {
          ...invoiceMaster.toObject(),
          postedDate: new Date(),
          // postedBy: userId, // <-- save manager ID
        },
      ],
      { session }
    );

    await PostedSalesInvoiceDetails.insertMany(
      invoiceDetails.map((d) => ({ ...d.toObject() })),
      { session }
    );

    // 3. Update ItemMaster
    for (let detail of invoiceDetails) {
      await ItemMaster.updateOne(
        { itemCode: detail.itemCode },
        {
          $inc: { itemRentCount: 1 },
          $set: {
            itemLastRented: invoiceMaster.deliveryDate, // delivery date
            itemLastRentedInv: invoiceNo,
          },
        },
        { session }
      );
    }

    // 4. Update Customer
    await CustomerMaster.updateOne(
      { customerId: invoiceMaster.customerId },
      {
        $set: {
          customerLastPurchaseDate: invoiceMaster.deliveryDate, // delivery date
          customerLastPurchaseInvoice: invoiceNo,
          customerLastPurchaseAmount: invoiceMaster.totalAmount,
        },
      },
      { session }
    );

    // 5. Delete from active collections
    await SalesInvoiceMaster.deleteOne({ invoiceNo }).session(session);
    await SalesInvoiceDetails.deleteMany({ invoiceNo }).session(session);

    // 6. Commit
    await session.commitTransaction();
    res
      .status(200)
      .json({ success: true, message: "Booking posted successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
}
