import express from "express";
import { manageExpenses } from "../controllers/expensesController.js";

const expensesRouter = express.Router();

expensesRouter.post("/expenses", manageExpenses);

export default expensesRouter;
