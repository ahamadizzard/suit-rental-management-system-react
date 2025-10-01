import DryClean from "../../models/inventory/dryCleanModel.js";

export async function getDryCleanByItemCode(req, res) {
  try {
    const dryCleans = await DryClean.find({
      itemCode: req.params.itemCode,
    }).sort({ date: -1 });
    res.status(200).json(dryCleans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function createDryClean(req, res) {
  const dryCleanData = req.body;
  try {
    const newDryClean = new DryClean(dryCleanData);
    await newDryClean.save();
    res.status(201).json(newDryClean);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
export async function getAllDryCleans(req, res) {
  try {
    const dryCleans = await DryClean.find().sort({ date: -1 });
    res.status(200).json(dryCleans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
export async function deleteDryClean(req, res) {
  try {
    const dryClean = await DryClean.findByIdAndDelete(req.params.id);
    if (!dryClean) {
      return res.status(404).json({ message: "Dry clean record not found" });
    }
    res.status(200).json({ message: "Dry clean record deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function bulkCreateDryCleans(req, res) {
  const dryCleanItems = req.body.items; // Expecting an array of dry clean items
  if (!Array.isArray(dryCleanItems) || dryCleanItems.length === 0) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  const session = await DryClean.startSession();
  session.startTransaction();
  try {
    const newDryCleans = await DryClean.insertMany(dryCleanItems, { session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: `${newDryCleans.length} dry clean records created successfully`,
      dryCleans: newDryCleans,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
}

// search functionality to be implemented in frontend
export async function searchDrycleans(req, res) {
  const rawQuery = req.params.query || req.query.q || "";
  const searchQuery = String(rawQuery).trim();
  try {
    if (!searchQuery) {
      return res.json([]); // nothing to search
    }

    // Escape user input for safe regex usage
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const qEsc = escapeRegex(searchQuery);

    // String fields to search
    const stringFields = [
      "drycleanId",
      "itemGroupShortDesc",
      "itemCode",
      "itemShortDesc",
      "itemSize",
    ];

    // Build $or conditions for string fields
    const orConditions = stringFields.map((field) => ({
      [field]: { $regex: qEsc, $options: "i" },
    }));

    // If query is a valid date, add date range search
    const parsedDate = new Date(searchQuery);
    if (!Number.isNaN(parsedDate.getTime())) {
      const start = new Date(parsedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsedDate);
      end.setHours(23, 59, 59, 999);
      orConditions.push({ drycleanDate: { $gte: start, $lte: end } });
    }

    const drycleans = await DryClean.find({ $or: orConditions }).sort({
      drycleanId: -1,
    });
    res.json(drycleans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
