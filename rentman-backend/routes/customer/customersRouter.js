import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerByName,
  getCustomerByEmail,
  getCustomerByTele,
  getCustomerByIsBlocked,
} from "../../controllers/customers/customerController.js";

const customersRouter = express.Router();

// customersRouter.get("/customers", getCustomers);
customersRouter.post("/", createCustomer);
customersRouter.get("/customers/:id", getCustomerById);
customersRouter.get("/", getAllCustomers);
customersRouter.put("/customers/:id", updateCustomer);
customersRouter.delete("/customers/:id", deleteCustomer);
customersRouter.get("/name/:name", getCustomerByName);
customersRouter.get("/email/:email", getCustomerByEmail);
customersRouter.get("/telephone/:telephone", getCustomerByTele);
customersRouter.get("/isBlocked/:isBlocked", getCustomerByIsBlocked);

export default customersRouter;
