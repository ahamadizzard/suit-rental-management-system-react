import express from "express";
import {
  getGroupMaster,
  getGroupMasterById,
  createGroupMaster,
  updateGroupMaster,
  getLastGroupId,
  deleteGroupMaster,
} from "../controllers/inventory/groupMasterController.js";

const groupMasterRouter = express.Router();

groupMasterRouter.get("/", getGroupMaster);
groupMasterRouter.get("/last", getLastGroupId);
groupMasterRouter.get("/:groupId", getGroupMasterById);
groupMasterRouter.post("/", createGroupMaster);
groupMasterRouter.put("/:groupId", updateGroupMaster);
groupMasterRouter.delete("/:groupId", deleteGroupMaster);

// itemMasterRouter.delete("/:itemCode", deleteItemMaster);

export default groupMasterRouter;
