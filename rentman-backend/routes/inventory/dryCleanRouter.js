import express from "express";
import { dryClean } from "../controllers/dryCleanController.js";

const dryCleanRouter = express.Router();

dryCleanRouter.post("/dryClean", dryClean);

export default dryCleanRouter;
