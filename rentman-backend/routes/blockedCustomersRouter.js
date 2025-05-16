import express from "express";
import { blockCustomer } from "../controllers/blockedCustomersController.js";

const blockedCustomersRouter = express.Router();

blockedCustomersRouter.post("/blockCustomer", blockCustomer);

export default blockedCustomersRouter;
