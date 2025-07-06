import express from "express";
import { itemSales } from "../controllers/itemSalesController.js";

const itemSalesRouter = express.Router();

itemSalesRouter.post("/itemSales", itemSales);

export default itemSalesRouter;
