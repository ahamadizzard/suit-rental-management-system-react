import express from "express";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByName,
  getEmployeeByTele,
  searchEmployees,
  updateEmployee,
} from "../../controllers/employee/employeesController.js";

const employeesRouter = express.Router();

employeesRouter.post("/", createEmployee);
employeesRouter.get("/", getAllEmployees);
employeesRouter.get("/employees/:id", getEmployeeById);
employeesRouter.get("/search/:query", searchEmployees);
employeesRouter.put("/employees/:id", updateEmployee);
employeesRouter.delete("/employees/:id", deleteEmployee);
employeesRouter.get("/name/:name", getEmployeeByName);
employeesRouter.get("/email/:email", getEmployeeByEmail);
employeesRouter.get("/telephone/:telephone", getEmployeeByTele);
// employeesRouter.get("/isBlocked/:isBlocked", getEm);

export default employeesRouter;
