import express from "express";
import {
  addDailyTransaction,
  deleteDailyTransaction,
  getDailyTransactionById,
  getDailyTransactions,
  getDailyTransactionsByDateRange,
  modifyDailyTransaction,
} from "../../controllers/sales/dailyTransactions.js";

const dailyTransactionsRouter = express.Router();

dailyTransactionsRouter.post("/", addDailyTransaction);
dailyTransactionsRouter.get("/", getDailyTransactions);
dailyTransactionsRouter.get("/:id", getDailyTransactionById);
dailyTransactionsRouter.put("/:id", modifyDailyTransaction);
dailyTransactionsRouter.delete("/:id", deleteDailyTransaction);
dailyTransactionsRouter.get("/date/:date", getDailyTransactionsByDateRange); // Assuming you want to get by date as well

export default dailyTransactionsRouter;
