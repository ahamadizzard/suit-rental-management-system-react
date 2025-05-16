import express from "express";
import { bookMaster } from "../controllers/bookingMasterController.js";

const bookingMasterRouter = express.Router();

bookingMasterRouter.post("/bookMaster", bookMaster);

export default bookingMasterRouter;
