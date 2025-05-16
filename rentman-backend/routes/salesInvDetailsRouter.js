import express from "express";
import { salesInvDetails } from "../controllers/salesInvDetailsController.js";

const salesInvDetailsRouter = express.Router();

salesInvDetailsRouter.get("/salesInvDetails", salesInvDetails);

export default salesInvDetailsRouter;
