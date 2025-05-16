import express from "express";
import { groupMaster } from "../controllers/groupMasterController.js";

const groupMasterRouter = express.Router();

groupMasterRouter.post("/groupMaster", groupMaster);

export default groupMasterRouter;
