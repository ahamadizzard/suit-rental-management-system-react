import express from "express";
import {
  getGroupMaster,
  getGroupMasterById,
  createGroupMaster,
  updateGroupMaster,
  getLastGroupId,
} from "../controllers/inventory/groupMasterController.js";

const groupMasterRouter = express.Router();

groupMasterRouter.get("/", getGroupMaster);
groupMasterRouter.get("/last", getLastGroupId);
groupMasterRouter.get("/:itemCode", getGroupMasterById);
groupMasterRouter.post("/", createGroupMaster);
groupMasterRouter.put("/:itemCode", updateGroupMaster);

// itemMasterRouter.delete("/:itemCode", deleteItemMaster);

export default groupMasterRouter;
