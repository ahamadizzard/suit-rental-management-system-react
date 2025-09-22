import express from "express";
import {
  addDailyTransaction,
  deleteDailyTransaction,
  getDailyTransactionById,
  getDailyTransactions,
  getDailyTransactionsByDate,
  getDailyTransactionsByDateRange,
  modifyDailyTransaction,
} from "../../controllers/sales/dailyTransactions.js";

const dailyTransactionsRouter = express.Router();

dailyTransactionsRouter.get("/date/:date", getDailyTransactionsByDate); // specific route
dailyTransactionsRouter.get("/daterange", getDailyTransactionsByDateRange); // specific route
dailyTransactionsRouter.get("/:id", getDailyTransactionById); // dynamic id
dailyTransactionsRouter.put("/:id", modifyDailyTransaction);
dailyTransactionsRouter.delete("/:id", deleteDailyTransaction);
dailyTransactionsRouter.post("/", addDailyTransaction);
dailyTransactionsRouter.get("/", getDailyTransactions); // generic route

export default dailyTransactionsRouter;
