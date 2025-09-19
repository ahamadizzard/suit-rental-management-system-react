import express from "express";
import {
  batchBookingDelete,
  batchBookingSave,
} from "../../controllers/sales/batchBookingController.js";

const batchBookingRouter = express.Router();
// const { batchBookingSave } = require("../controllers/batchBookingController");

batchBookingRouter.post("/batch", batchBookingSave);
batchBookingRouter.delete("/:invoiceNo", batchBookingDelete);

export default batchBookingRouter;
