// import { saveDrycleanAndTransaction } from "../../controllers/sales/dailyTransactions.js";
import mongoose from "mongoose";
import { saveDrycleanAndTransaction } from "../../controllers/other/drycleanAndTransactionController.js";
import express from "express";

const drycleanAndTransactionRouter = express.Router();

drycleanAndTransactionRouter.post(
  "/bulk-with-transaction",
  saveDrycleanAndTransaction
);

export default drycleanAndTransactionRouter;
