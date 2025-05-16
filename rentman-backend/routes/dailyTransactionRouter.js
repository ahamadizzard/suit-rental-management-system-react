import express from "express";
import { dailyTransaction } from "../controllers/dailyTransactionController.js";

const dailyTransactionRouter = express.Router();

dailyTransactionRouter.post("/dailyTransaction", dailyTransaction);

export default dailyTransactionRouter;
