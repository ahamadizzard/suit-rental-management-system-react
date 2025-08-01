import express from "express";
// import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import itemMasterRouter from "./routes/inventory/itemMasterRouter.js";
import userRouter from "./routes/employee/userRouter.js";
import cors from "cors";
import bodyParser from "body-parser";
import groupMasterRouter from "./routes/inventory/groupMasterRouter.js";
import salesInvoiceMasterRouter from "./routes/sales/Not Completed/salesInvoiceMasterRouter.js";
import contributorRouter from "./routes/inventory/contributorRouter.js";
import salesInvoiceDetails from "./routes/sales/salesInvoiceDetailsRouter.js";
import customersRouter from "./routes/customer/customersRouter.js";
import dailyTransactionsRouter from "./routes/sales/dailyTransactionsRouter.js";
import salesInvoiceDetailsRouter from "./routes/sales/salesInvoiceDetailsRouter.js";
import batchBookingRouter from "./routes/sales/batchBookingRouter.js";

dotenv.config();
const PORT = process.env.PORT || 6000;
const app = express();
// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());

// Middleware to check if the user is authenticated
// This middleware will run for every request
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  // const token = tokenString.split(" ")[1]; // split the token string by space and get the second element
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    // console.log(token);
    jwt.verify(token, "rentmanager@2025", (err, decoded) => {
      if (decoded != null) {
        // console.log(decoded);
        req.user = decoded;
        next();
      } else {
        console.log("Invalid token");
        res.status(403).json({ message: "Invalid token" });
      }
    });
  } else {
    next();
  }
});

//connecting to the database
connectDB();

app.use("/api/itemmaster", itemMasterRouter);
app.use("/api/groupmaster", groupMasterRouter);
app.use("/api/contributor", contributorRouter);

app.use("/api/users", userRouter);

app.use("/api/salesinvoice", salesInvoiceMasterRouter);
app.use("/api/salesinvoicedetails", salesInvoiceDetailsRouter);
app.use("/api/dailytransactions", dailyTransactionsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/batchbooking", batchBookingRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
