import express from "express";
import {
  getItemMaster,
  getItemMasterById,
  createItemMaster,
  updateItemMaster,
  getItemByCode,
  updateItemByCode,
  getItemByGroupShortDesc,
  deleteItemByCode,
} from "../../controllers/inventory/itemMasterController.js";

const itemMasterRouter = express.Router();

itemMasterRouter.get("/", getItemMaster);
itemMasterRouter.get("/:itemCode", getItemByCode);
itemMasterRouter.post("/", createItemMaster);
itemMasterRouter.put("/:itemCode", updateItemByCode);
// itemMasterRouter.get("/:itemGroupShortDesc", getItemByGroupShortDesc);
itemMasterRouter.get("/group/:itemGroupShortDesc", getItemByGroupShortDesc);
itemMasterRouter.delete("/:itemCode", deleteItemByCode);

// itemMasterRouter.delete("/:itemCode", deleteItemMaster);

export default itemMasterRouter;
