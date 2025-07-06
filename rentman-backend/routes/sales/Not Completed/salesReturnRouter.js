import express from "express";
import { salesReturn } from "../controllers/salesReturnController.js";

const salesReturnRouter = express.Router();

salesReturnRouter.post("/salesReturn", salesReturn);

export default salesReturnRouter;
