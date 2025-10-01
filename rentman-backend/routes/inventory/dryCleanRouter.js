import express from "express";
// import { dryClean } from "../controllers/dryCleanController.js";
import {
  bulkCreateDryCleans,
  createDryClean,
  deleteDryClean,
  getAllDryCleans,
  getDryCleanByItemCode,
  searchDrycleans,
} from "../../controllers/inventory/dryCleanController.js";

const dryCleanRouter = express.Router();

dryCleanRouter.post("/dryClean", createDryClean);
dryCleanRouter.post("/dryClean/bulk", bulkCreateDryCleans);
dryCleanRouter.get("/dryClean/:itemCode", getDryCleanByItemCode);
dryCleanRouter.get("/search/:query", searchDrycleans);
dryCleanRouter.delete("/by-drycleanid/:drycleanId", deleteDryClean);
dryCleanRouter.get("/", getAllDryCleans);

export default dryCleanRouter;
