import express from "express";
import { getCustomers } from "../controllers/customersController.js";

const customersRouter = express.Router();

customersRouter.get("/customers", getCustomers);

export default customersRouter;
