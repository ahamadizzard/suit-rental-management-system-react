import express from "express";
import { salesInvDetails } from "../controllers/salesInvDetailsMasterController.js";

const salesInvDetailsRouter = express.Router();

salesInvDetailsRouter.get("/salesInvDetails", salesInvDetails);

export default salesInvDetailsRouter;
