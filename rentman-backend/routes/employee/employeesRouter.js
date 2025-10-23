import express from "express";
import {
  createEmployee,
  getAllEmployees,
} from "../../controllers/employee/employeesController.js";

const employeesRouter = express.Router();

employeesRouter.post("/", createEmployee);
employeesRouter.get("/", getAllEmployees);

export default employeesRouter;
