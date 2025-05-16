import express from "express";
import {
  getItemMaster,
  getItemMasterById,
  createItemMaster,
  updateItemMaster,
} from "../controllers/inventory/itemMasterController.js";

const itemMasterRouter = express.Router();

itemMasterRouter.get("/", getItemMaster);
itemMasterRouter.get("/:itemCode", getItemMasterById);
itemMasterRouter.post("/", createItemMaster);
itemMasterRouter.put("/:itemCode", updateItemMaster);

// itemMasterRouter.delete("/:itemCode", deleteItemMaster);

export default itemMasterRouter;
