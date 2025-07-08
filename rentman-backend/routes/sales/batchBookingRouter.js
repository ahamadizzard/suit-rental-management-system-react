import express from "express";
import { batchBookingSave } from "../../controllers/sales/batchBookingController.js";

const batchBookingRouter = express.Router();
// const { batchBookingSave } = require("../controllers/batchBookingController");

batchBookingRouter.post("/batch", batchBookingSave);

export default batchBookingRouter;
